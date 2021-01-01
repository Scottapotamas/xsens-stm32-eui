/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "app_background.h"
#include "app_task_communication.h"
#include "app_times.h"
#include "global.h"
#include "timer_ms.h"

#include "button.h"
#include "hal_adc.h"
#include "hal_system_speed.h"
#include "sensors.h"
#include "status.h"

#include "configuration.h"

/* -------------------------------------------------------------------------- */

PRIVATE timer_ms_t button_timer = 0;
PRIVATE timer_ms_t adc_timer    = 0;

/* -------------------------------------------------------------------------- */

PUBLIC void
app_background_init( void )
{
    timer_ms_start( &button_timer, BACKGROUND_RATE_BUTTON_MS );
    timer_ms_start( &adc_timer, BACKGROUND_ADC_AVG_POLL_MS );    //refresh ADC readings
}

/* -------------------------------------------------------------------------- */

PUBLIC void
app_background( void )
{
    //rate limit less important background processes
    AppTaskCommunication_rx_tick();
    hal_adc_tick();

    if( timer_ms_is_expired( &button_timer ) )
    {
        button_process();
        timer_ms_start( &button_timer, BACKGROUND_RATE_BUTTON_MS );
    }

    if( timer_ms_is_expired( &adc_timer ) )
    {
        sensors_microcontroller_C();

        config_set_cpu_load( hal_system_speed_get_load() );
        config_set_cpu_clock( hal_system_speed_get_speed() );
        config_update_task_statistics();

        timer_ms_start( &adc_timer, BACKGROUND_ADC_AVG_POLL_MS );
    }

}

/* ----- End ---------------------------------------------------------------- */
