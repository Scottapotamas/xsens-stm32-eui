/* ----- System Includes ---------------------------------------------------- */

#include <event_subscribe.h>
#include <string.h>

/* ----- Local Includes ----------------------------------------------------- */
#include "app_config.h"
#include "app_events.h"
#include "app_signals.h"
#include "app_times.h"
#include "app_version.h"
#include "global.h"
#include "qassert.h"

#include "app_task_supervisor.h"
#include "app_task_supervisor_private.h"

#include "configuration.h"
#include "sensors.h"
#include "status.h"

/* -------------------------------------------------------------------------- */

DEFINE_THIS_FILE; /* Used for ASSERT checks to define __FILE__ only once */

/* ----- Public Functions --------------------------------------------------- */

PUBLIC StateTask *
appTaskSupervisorCreate( AppTaskSupervisor *me,
                         StateEvent *       eventQueueData[],
                         const uint8_t      eventQueueSize )
{
    // Clear all task data
    memset( me, 0, sizeof( AppTaskSupervisor ) );

    // Initialise State Machine State
    AppTaskSupervisorConstructor( me );

    /* Initialise State Machine Task */
    return stateTaskCreate( (StateTask *)me,
                            eventQueueData,
                            eventQueueSize,
                            0,
                            0 );
}

/* ----- Private Functions -------------------------------------------------- */

/* ----- Private Functions -------------------------------------------------- */

// State Machine Construction
PRIVATE void AppTaskSupervisorConstructor( AppTaskSupervisor *me )
{
    stateTaskCtor( &me->super, (State)&AppTaskSupervisor_initial );
}

/* -------------------------------------------------------------------------- */

// State Machine Initial State
PRIVATE void AppTaskSupervisor_initial( AppTaskSupervisor *me,
                                        const StateEvent * e __attribute__( ( __unused__ ) ) )
{
    button_init( BUTTON_0, AppTaskSupervisorButtonEvent );
    button_init( BUTTON_1, AppTaskSupervisorButtonEvent );

    // Detect user activities
    eventSubscribe( (StateTask *)me, BUTTON_NORMAL_SIGNAL );
    eventSubscribe( (StateTask *)me, BUTTON_PRESSED_SIGNAL );

    STATE_INIT( &AppTaskSupervisor_main );
}

/* -------------------------------------------------------------------------- */

PRIVATE STATE AppTaskSupervisor_main( AppTaskSupervisor *me,
                                      const StateEvent * e )
{
    switch( e->signal )
    {
        case STATE_ENTRY_SIGNAL: {
            //start the board hardware sensors
            sensors_enable();

            status_green( false );
            status_yellow( false );
            status_blue( false );

            return 0;
        }

        case BUTTON_NORMAL_SIGNAL:
            switch( ( (ButtonPressedEvent *)e )->id )
            {
                case BUTTON_0:

                    return 0;

                case BUTTON_1:

                    return 0;

                default:
                    break;
            }
            break;

        case BUTTON_PRESSED_SIGNAL:
            switch( ( (ButtonPressedEvent *)e )->id )
            {
              case BUTTON_0:

                return 0;

                default:
                    break;
            }
            break;

        case STATE_INIT_SIGNAL:
            STATE_INIT( &AppTaskSupervisor_disarmed );
            return 0;
    }
    return (STATE)hsmTop;
}

/* -------------------------------------------------------------------------- */

// Placeholder state

PRIVATE STATE AppTaskSupervisor_disarmed( AppTaskSupervisor *me,
                                          const StateEvent * e )
{
    switch( e->signal )
    {
        case STATE_ENTRY_SIGNAL:

            status_green( false );
            status_yellow( false );

            return 0;


        case STATE_EXIT_SIGNAL:

            return 0;
    }
    return (STATE)AppTaskSupervisor_main;
}

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */

/*
 * Button handling publishes event
 */

PRIVATE void AppTaskSupervisorButtonEvent( ButtonId_t        button,
                                           ButtonPressType_t press_type )
{
    if( press_type == BUTTON_PRESS_TYPE_NORMAL )
    {
        ButtonEvent *be = EVENT_NEW( ButtonEvent, BUTTON_NORMAL_SIGNAL );
        if( be )
        {
            be->id         = button;
            be->press_type = press_type;
            eventPublish( (StateEvent *)be );
        }
    }
    else if( press_type == BUTTON_PRESS_TYPE_DOWN )
    {
        ButtonEvent *be = EVENT_NEW( ButtonEvent, BUTTON_PRESSED_SIGNAL );
        if( be )
        {
            be->id         = button;
            be->press_type = press_type;
            eventPublish( (StateEvent *)be );
        }
    }
}
/* ----- End ---------------------------------------------------------------- */
