/* ----- System Includes ---------------------------------------------------- */

#include <event_subscribe.h>
#include <string.h>

/* ----- Local Includes ----------------------------------------------------- */
#include "app_config.h"
#include "app_events.h"
#include "app_signals.h"
#include "app_times.h"

#include "app_task_communication.h"
#include "configuration.h"
#include "hal_uart.h"

#include "electricui.h"
#include "xsens_mti.h"
#include "xsens_utility.h"

/* ----- Private Function Definitions --------------------------------------- */

PRIVATE void AppTaskCommunicationConstructor( AppTaskCommunication *me );

PRIVATE void AppTaskCommunication_initial( AppTaskCommunication *me, const StateEvent *e );

PRIVATE void AppTaskCommunication_tx_put_imu( uint8_t *c, uint16_t length );

PRIVATE void AppTaskCommunication_tx_put_external( uint8_t *c, uint16_t length );

PRIVATE void AppTaskCommunication_tx_put_pc( uint8_t *c, uint16_t length );

PRIVATE void AppTaskCommunication_tx_put_usb( uint8_t *c, uint16_t length );

PRIVATE void AppTaskCommunication_rx_callback_uart( HalUartPort_t port, uint8_t c );

PRIVATE void AppTaskCommunication_rx_callback_cdc( uint8_t c );

PRIVATE STATE AppTaskCommunication_main( AppTaskCommunication *me, const StateEvent *e );

PRIVATE STATE AppTaskCommunication_electric_ui( AppTaskCommunication *me, const StateEvent *e );

PRIVATE void AppTaskCommunication_eui_callback_external( uint8_t message );

PRIVATE void AppTaskCommunication_eui_callback_pc( uint8_t message );

PRIVATE void AppTaskCommunication_eui_callback_usb( uint8_t message );

PRIVATE void AppTaskCommunication_imu_callback_event( XsensEventFlag_t event, XsensEventData_t *mtdata );

enum
{
    LINK_PC = 0,
    LINK_EXTERNAL,
    LINK_USB
} EUI_LINK_NAMES;

eui_interface_t communication_interface[] = {
    EUI_INTERFACE_CB( &AppTaskCommunication_tx_put_pc, &AppTaskCommunication_eui_callback_pc ),
    EUI_INTERFACE_CB( &AppTaskCommunication_tx_put_external, &AppTaskCommunication_eui_callback_external ),
    EUI_INTERFACE_CB( &AppTaskCommunication_tx_put_usb, &AppTaskCommunication_eui_callback_usb ),
};

xsens_interface_t imu_interface = { .event_cb = &AppTaskCommunication_imu_callback_event, .output_cb = &AppTaskCommunication_tx_put_imu };

/* ----- Public Functions --------------------------------------------------- */

PUBLIC StateTask *
       appTaskCommunicationCreate( AppTaskCommunication *        me,
                                   StateEvent *                  eventQueueData[],
                                   const uint8_t                 eventQueueSize,
                                   const CommunicationInstance_t instance )
{
    // Clear all task data
    memset( me, 0, sizeof( AppTaskCommunication ) );

    // Initialise State Machine State
    AppTaskCommunicationConstructor( me );

    me->instance = instance;

    /* Initialise State Machine Task */
    return stateTaskCreate( (StateTask *)me,
                            eventQueueData,
                            eventQueueSize,
                            0,
                            0 );
}

/* ----- Private Functions -------------------------------------------------- */

// State Machine Construction
PRIVATE void AppTaskCommunicationConstructor( AppTaskCommunication *me )
{
    stateTaskCtor( &me->super, (State)&AppTaskCommunication_initial );
}

/* -------------------------------------------------------------------------- */

// State Machine Initial State
PRIVATE void AppTaskCommunication_initial( AppTaskCommunication *me,
                                           const StateEvent *    e __attribute__( ( __unused__ ) ) )
{

    STATE_INIT( &AppTaskCommunication_main );
}

/* -------------------------------------------------------------------------- */

PRIVATE STATE AppTaskCommunication_main( AppTaskCommunication *me,
                                         const StateEvent *    e )
{
    switch( e->signal )
    {
        case STATE_ENTRY_SIGNAL: {

            return 0;
        }

        case STATE_INIT_SIGNAL:
            STATE_INIT( &AppTaskCommunication_electric_ui );
            return 0;
    }
    return (STATE)hsmTop;
}

/* -------------------------------------------------------------------------- */

PRIVATE STATE AppTaskCommunication_electric_ui( AppTaskCommunication *me,
                                                const StateEvent *    e )
{
    switch( e->signal )
    {
        case STATE_ENTRY_SIGNAL:

            switch( me->instance )
            {
                case INTERFACE_UART_PC:
                    hal_uart_init( HAL_UART_PORT_PC );
                    break;

                case INTERFACE_UART_IMU:
                    hal_uart_init( HAL_UART_PORT_IMU );
                    break;

                case INTERFACE_UART_EXTERNAL:
                    hal_uart_init( HAL_UART_PORT_EXTERNAL );
                    break;

                case INTERFACE_USB_EXTERNAL:
                    //todo init cdc here
                    //todo setup callback to AppTaskCommunication_rx_callback_cdc

                    break;
            }

            //eUI setup
            EUI_LINK( communication_interface );
            configuration_electric_setup();    //get the configuration driver to setup access to variables

            return 0;

        case STATE_EXIT_SIGNAL:

            return 0;
    }
    return (STATE)AppTaskCommunication_main;
}

/* -------------------------------------------------------------------------- */

PRIVATE void
AppTaskCommunication_tx_put_external( uint8_t *c, uint16_t length )
{
    hal_uart_write( HAL_UART_PORT_EXTERNAL, c, length );
}

PRIVATE void
AppTaskCommunication_tx_put_imu( uint8_t *c, uint16_t length )
{
    hal_uart_write( HAL_UART_PORT_IMU, c, length );
}

PRIVATE void AppTaskCommunication_tx_put_pc( uint8_t *c, uint16_t length )
{
    hal_uart_write( HAL_UART_PORT_PC, c, length );
}

PRIVATE void
AppTaskCommunication_tx_put_usb( uint8_t *c, uint16_t length )
{
}

/* -------------------------------------------------------------------------- */

PRIVATE void
AppTaskCommunication_rx_callback_uart( HalUartPort_t port, uint8_t c )
{
    switch( port )
    {
        case HAL_UART_PORT_PC:
            eui_parse( c, &communication_interface[LINK_PC] );
            break;

        case HAL_UART_PORT_EXTERNAL:
            // TODO Use this serial port
            break;

        case HAL_UART_PORT_IMU:
            // IMU
            xsens_mti_parse( &imu_interface, c );
            break;

        default:
            break;
    }
}

PRIVATE void
AppTaskCommunication_rx_callback_cdc( uint8_t c )
{
    eui_parse( c, &communication_interface[LINK_USB] );
}

bool first_byte  = false;
bool second_byte = false;

PUBLIC void
AppTaskCommunication_rx_tick( void )
{
    while( hal_uart_rx_data_available( HAL_UART_PORT_PC ) )
    {
        eui_parse( hal_uart_rx_get( HAL_UART_PORT_PC ), &communication_interface[LINK_PC] );
    }

    while( hal_uart_rx_data_available( HAL_UART_PORT_IMU ) )
    {
        xsens_mti_parse( &imu_interface, hal_uart_rx_get( HAL_UART_PORT_IMU ) );
    }
}

/* -------------------------------------------------------------------------- */

PRIVATE void
AppTaskCommunication_eui_callback_external( uint8_t message )
{
    configuration_eui_callback( LINK_EXTERNAL, &communication_interface[LINK_EXTERNAL], message );
}

PRIVATE void AppTaskCommunication_eui_callback_pc( uint8_t message )
{
    configuration_eui_callback( LINK_PC, &communication_interface[LINK_PC], message );
}

PRIVATE void
AppTaskCommunication_eui_callback_usb( uint8_t message )
{
    configuration_eui_callback( LINK_USB, &communication_interface[LINK_USB], message );
}

PRIVATE void AppTaskCommunication_imu_callback_event( XsensEventFlag_t event, XsensEventData_t *mtdata )
{
    // Got IMU data?
    switch( event )
    {
        case XSENS_EVT_PACKET_COUNT:

            break;

        case XSENS_EVT_TIME_FINE:

            break;

        case XSENS_EVT_TIME_COARSE:

            break;

        case XSENS_EVT_QUATERNION:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT4 )
            {
                config_update_quaternion( mtdata->data.f4x4[0], mtdata->data.f4x4[1], mtdata->data.f4x4[2], mtdata->data.f4x4[3] );

//                float pry[3] = { 0 };
//                xsens_quaternion_to_euler( mtdata->data.f4x4, pry );
//
//                // Convert from radians to degrees
//                pry[0] *= (180.0 / 3.14159265358979323846);
//                pry[1] *= (180.0 / 3.14159265358979323846);
//                pry[2] *= (180.0 / 3.14159265358979323846);

//                config_update_pry( pry[1], pry[0], pry[2] );
            }
            break;

        case XSENS_EVT_DELTA_Q:

            break;

        case XSENS_EVT_ACCELERATION:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT3 )
            {
                config_update_acceleration( mtdata->data.f4x3[0], mtdata->data.f4x3[1], mtdata->data.f4x3[2] );
            }
            break;

        case XSENS_EVT_FREE_ACCELERATION:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT3 )
            {
                config_update_free_acceleration( mtdata->data.f4x3[0], mtdata->data.f4x3[1], mtdata->data.f4x3[2] );
            }
            break;

        case XSENS_EVT_DELTA_V:

            break;

        case XSENS_EVT_RATE_OF_TURN:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT3 )
            {
                config_update_rate_of_turn( mtdata->data.f4x3[0], mtdata->data.f4x3[1], mtdata->data.f4x3[2] );
            }
            break;

        case XSENS_EVT_MAGNETIC:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT3 )
            {
                config_update_magnetometer( mtdata->data.f4x3[0], mtdata->data.f4x3[1], mtdata->data.f4x3[2] );
            }
            break;

        case XSENS_EVT_PRESSURE:
            if( mtdata->type == XSENS_EVT_TYPE_U32 )
            {
                config_update_pressure( mtdata->data.u4 );
            }
            break;

        case XSENS_EVT_TEMPERATURE:
            if( mtdata->type == XSENS_EVT_TYPE_FLOAT )
            {
                config_update_imu_temperature( mtdata->data.f4 );
            }
            break;

        case XSENS_EVT_STATUS_WORD:
            if( mtdata->type == XSENS_EVT_TYPE_U32 )
            {
                config_update_imu_status_fields( mtdata->data.u4 );
            }

            break;
    }
}

/* ----- End ---------------------------------------------------------------- */
