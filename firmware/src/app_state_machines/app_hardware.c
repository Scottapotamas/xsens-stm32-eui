/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "hal_adc.h"
#include "hal_gpio.h"
#include "hal_reset.h"
#include "hal_system_speed.h"
#include "hal_systick.h"
#include "hal_uart.h"
#include "hal_watchdog.h"

#include "configuration.h"
#include "sensors.h"
#include "status.h"
/* -------------------------------------------------------------------------- */

PUBLIC void
app_hardware_init( void )
{
    // Configure GPIO pins
    hal_gpio_configure_defaults();

    // Start the watchdog
    hal_watchdog_init( 5000 );

    // Initialise the CPU manager DWT
    hal_system_speed_init();

    // Continue basic I/O setup
    status_green( true );
    status_yellow( true );
    status_red( true );
    status_blue( true );

    hal_systick_init();

    // We need to do a full reset of usart clocks/peripherals on boot, as the DMA setup seems
    // to cling onto error flags across firmware flashing - making debugging hard
    hal_uart_global_deinit();

    hal_adc_init();

    configuration_init();

    // Check for the cause of the microcontroller booting (errors vs normal power up)
    config_set_reset_cause( hal_reset_cause_description( hal_reset_cause() ) );

    sensors_init();

}

/* ----- End ---------------------------------------------------------------- */
