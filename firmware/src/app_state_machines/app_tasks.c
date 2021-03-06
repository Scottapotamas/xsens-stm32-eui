/* ----- System Includes ---------------------------------------------------- */

#include <string.h>

/* ----- Local Includes ----------------------------------------------------- */
/* Task & State Machine Support */
#include "app_background.h"
#include "app_events.h"
#include "app_hardware.h"
#include "app_signals.h"
#include "app_task_ids.h"
#include "app_times.h"
#include "event_subscribe.h"
#include "global.h"
#include "qassert.h"
#include "state_task.h"
#include "state_tasker.h"

/* Application Tasks */
#include "app_task_communication.h"
#include "app_task_supervisor.h"

#include "button.h"
#include "hal_button.h"
#include "hal_systick.h"

/* -------------------------------------------------------------------------- */

DEFINE_THIS_FILE; /* Used for ASSERT checks to define __FILE__ only once */

/* -------------------------------------------------------------------------- */

// ~~~ Event Pool Types ~~~

/** Up to three distinct storage pools. */
EventPool eventPool[3];

typedef struct {
  uint32_t example[10];
} ExampleEventType_t;

/** @note: Select the following typedefs as approximately the largest
 *         within their group of small, medium and large structures.
 *         You need to make sure that EventsLargeType corresponds to the
 *         biggest event that can be allocated.
 */
typedef ButtonPressedEvent EventsSmallType;
typedef ButtonEvent        EventsMediumType;
typedef ExampleEventType_t EventsLargeType;

// ~~~ Event Pool Storage ~~~
EventsSmallType  eventsSmall[10];     //  __attribute__ ((section (".ccmram")))
EventsMediumType eventsMedium[15];    //  __attribute__ ((section (".ccmram")))
EventsLargeType __attribute__( ( section( ".ccmram" ) ) ) eventsLarge[12];

// ~~~ Event Subscription Data ~~~
EventSubscribers eventSubscriberList[STATE_MAX_SIGNAL];

// ~~~ Task Control Blocks & Event Queues ~~~

AppTaskCommunication appTaskCommunication;
StateEvent *         appTaskCommunicationEventQueue[10];

AppTaskSupervisor appTaskSupervisor;
StateEvent *      appTaskSupervisorEventQueue[20];

// ~~~ Tasker ~~~

PRIVATE StateTasker_t mainTasker;
PUBLIC StateTask *mainTaskTable[TASK_MAX];

/* ----- Public Functions --------------------------------------------------- */

PUBLIC
void app_tasks_init( void )
{
    /* ~~~ Tasker Handling Initialisation ~~~ */
    stateTaskerInit( &mainTasker, mainTaskTable, TASK_MAX );

    /* ~~~ Dynamic Event Pools Initialisation ~~~ */
    eventPoolInit( eventPool,
                   DIM( eventPool ) );

    ALLEGE( eventPoolAddStorage( (StateEvent *)&eventsSmall,
                                 DIM( eventsSmall ),
                                 sizeof( EventsSmallType ) )
            != 0 );

    ALLEGE( eventPoolAddStorage( (StateEvent *)&eventsMedium,
                                 DIM( eventsMedium ),
                                 sizeof( EventsMediumType ) )
            != 0 );

    ALLEGE( eventPoolAddStorage( (StateEvent *)&eventsLarge,
                                 DIM( eventsLarge ),
                                 sizeof( EventsLargeType ) )
            != 0 );

    /* ~~~ Event Subscription Tables Initialisation ~~~ */
    eventSubscribeInit( mainTaskTable, eventSubscriberList, STATE_MAX_SIGNAL );

    /* ~~~ Event Timers Initialisation ~~~ */
    eventTimerInit();

    /* ~~~ Init background processes ~~~ */
    app_background_init();

    /* ~~~ State Machines Initialisation ~~~ */
    StateTask *t;

    //Handle communications (comms to computers/phones etc)
    t = appTaskCommunicationCreate( &appTaskCommunication,
                                    appTaskCommunicationEventQueue,
                                    DIM( appTaskCommunicationEventQueue ), INTERFACE_UART_PC);

    stateTaskerAddTask( &mainTasker, t, TASK_COMMUNICATION, "Comms" );
    stateTaskerStartTask( &mainTasker, t );

  t = appTaskCommunicationCreate( &appTaskCommunication,
                                  appTaskCommunicationEventQueue,
                                  DIM( appTaskCommunicationEventQueue ), INTERFACE_UART_IMU );

  stateTaskerAddTask( &mainTasker, t, TASK_IMU, "IMU" );
  stateTaskerStartTask( &mainTasker, t );


    //Overseer task
    t = appTaskSupervisorCreate( &appTaskSupervisor,
                                 appTaskSupervisorEventQueue,
                                 DIM( appTaskSupervisorEventQueue ) );

    stateTaskerAddTask( &mainTasker, t, TASK_SUPERVISOR, "Supervisor" );
    stateTaskerStartTask( &mainTasker, t );

    hal_systick_hook( 1, eventTimerTick );
}

/* -------------------------------------------------------------------------- */

/* Run a cycle of the application state machine dispatcher. Returns true
 * when there is more events to be processed. False when the state machines
 * are idle.
 */

PUBLIC bool
app_tasks_run( void )
{
    /* Run the background processes. */
    app_background();

    /* Run a single task event. */
    return stateTaskerRunEvent( &mainTasker );
}

/* -------------------------------------------------------------------------- */

/** Return a pointer to the task structure identified by id */

PUBLIC StateTask *
app_task_by_id( uint8_t id )
{
    return stateTaskerGetTaskById( &mainTasker, id );
}

/* -------------------------------------------------------------------------- */

/** Clear the task handling statistics */

PUBLIC void
app_task_clear_statistics( void )
{
    stateTaskerClearStatistics( &mainTasker );
}

/* ----- End ---------------------------------------------------------------- */
