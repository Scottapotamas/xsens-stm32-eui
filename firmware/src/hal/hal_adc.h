#ifndef HAL_ADC_H
#define HAL_ADC_H

#ifdef __cplusplus
extern "C" {
#endif

/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "global.h"

/* ----- Types ------------------------------------------------------------- */

typedef enum
{
    HAL_ADC_INPUT_A,
    HAL_ADC_INPUT_TEMP_INTERNAL, /* ADC1-TEMP - RANK 9 */
    HAL_ADC_INPUT_VREFINT,       /* ADC1-VREF - RANK 10 */
    HAL_ADC_INPUT_NUM
} HalAdcInput_t;

/* ------------------------- Functions Prototypes --------------------------- */

PUBLIC void
hal_adc_init( void );

/* -------------------------------------------------------------------------- */

/** Return true when there are active samples in the averaging buffer */

PUBLIC bool
hal_adc_valid( HalAdcInput_t input );

/* -------------------------------------------------------------------------- */

/** Last converted ADC read */

PUBLIC uint32_t
hal_adc_read( HalAdcInput_t input );

/* -------------------------------------------------------------------------- */

/** Averaged ADC read */

PUBLIC uint32_t
hal_adc_read_avg( HalAdcInput_t input );

/* -------------------------------------------------------------------------- */

PUBLIC uint32_t
hal_adc_read_peak( HalAdcInput_t input );

/* -------------------------------------------------------------------------- */

/** Start DMA based ADC conversions */

PUBLIC void
hal_adc_start( HalAdcInput_t input, uint16_t poll_rate_ms );

/* -------------------------------------------------------------------------- */

/** Stop DMA based ADC conversions */

PUBLIC void
hal_adc_stop( HalAdcInput_t input );

/* -------------------------------------------------------------------------- */

/** Timer tick to trigger a ADC conversion cycle */

PUBLIC void
hal_adc_tick( void );

/* -------------------------------------------------------------------------- */

void ADC_IRQHandler( void );

/* -------------------------------------------------------------------------- */

void DMA2_Stream0_IRQHandler( void );

/* -------------------------------------------------------------------------- */

/** STM32 HAL error callback */

extern void _Error_Handler( char *, int );

/* ------------------------- End -------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /* HAL_ADC_H */
