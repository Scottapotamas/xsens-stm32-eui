/* ----- System Includes ---------------------------------------------------- */

#include <math.h>

/* ----- Local Includes ----------------------------------------------------- */

#include "hal_temperature.h"

/* -------------------------------------------------------------------------- */

/* Temperature Calibration Values
 * See STM32F4xx datasheet "Temperature sensor characteristics"
 * */

#define V25       0.76f   /* V */
#define AVG_SLOPE 0.0025f /* 2.5mV/C */

PUBLIC float
hal_temperature_micro_degrees_C( uint32_t raw_adc )
{
    if( raw_adc == 0 )
    {
        return -1000.0;
    }

    float Vsense = ( (float)raw_adc * 3.3f ) / 4096.0f;

    return ( ( ( Vsense - V25 ) / AVG_SLOPE ) + 25.0f );
}

/* ----- End ---------------------------------------------------------------- */
