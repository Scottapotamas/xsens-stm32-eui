#ifndef SENSORS_H
#define SENSORS_H

#ifdef __cplusplus
extern "C" {
#endif

/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "global.h"
#include "hal_adc.h"

/* ----- Defines ------------------------------------------------------------ */

/* ----- Public Functions --------------------------------------------------- */

/* Optionally init any required hardware */

PUBLIC void
sensors_init( void );

/* -------------------------------------------------------------------------- */

/** Enable adc for each channel */

PUBLIC void
sensors_enable( void );

/* -------------------------------------------------------------------------- */

/** Disable adc for relevant channels */

PUBLIC void
sensors_disable( void );

/* -------------------------------------------------------------------------- */

/** Return averaged and normalised temperature readings */

PUBLIC float
sensors_microcontroller_C( void );

/* -------------------------------------------------------------------------- */

/* ----- End ---------------------------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /* SENSORS_H */
