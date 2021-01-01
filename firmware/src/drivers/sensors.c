/* ----- Local Includes ----------------------------------------------------- */

#include "sensors.h"
#include "app_times.h"
#include "configuration.h"
#include "hal_adc.h"
#include "hal_power.h"
#include "hal_temperature.h"

/* ----- Public Functions --------------------------------------------------- */

/* Init the hardware for the board sensors */

PUBLIC void
sensors_init( void )
{
}

/* -------------------------------------------------------------------------- */

/* Start/Enable board sensors */

PUBLIC void
sensors_enable( void )
{
    hal_adc_start( HAL_ADC_INPUT_A, ADC_SAMPLE_RATE_MS );
    hal_adc_start( HAL_ADC_INPUT_TEMP_INTERNAL, ADC_SAMPLE_RATE_MS );
    hal_adc_start( HAL_ADC_INPUT_VREFINT, ADC_SAMPLE_RATE_MS );

}

/* -------------------------------------------------------------------------- */

/* Stop/Disable board sensors */

PUBLIC void
sensors_disable( void )
{
    hal_adc_stop( HAL_ADC_INPUT_A );
    hal_adc_stop( HAL_ADC_INPUT_TEMP_INTERNAL );
    hal_adc_stop( HAL_ADC_INPUT_VREFINT );

}

/* -------------------------------------------------------------------------- */

/* Return averaged and converted temperature readings in degrees C */

PUBLIC float
sensors_microcontroller_C( void )
{
    float die_temp = hal_temperature_micro_degrees_C( hal_adc_read_avg( HAL_ADC_INPUT_TEMP_INTERNAL ) );
    config_set_temp_cpu( die_temp );
    return die_temp;
}


/* ----- End ---------------------------------------------------------------- */
