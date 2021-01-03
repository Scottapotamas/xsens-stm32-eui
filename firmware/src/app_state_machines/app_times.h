#ifndef APP_TIMES_H
#define APP_TIMES_H

#ifdef __cplusplus
extern "C" {
#endif

#include "global.h"

/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */

enum AppTimeoutsMs
{
    TIME_BUTTON_POLL_MS              = 100U,  /* ms */
    TIME_BUTTON_DEFAULTS_ACTIVATE_MS = 5000U, /* ms */

    TIME_BUTTON_NORMAL_PRESS = 50U,   /* ms */
    TIME_BUTTON_LONG_PRESS   = 1500U, /* ms */
};

/* -------------------------------------------------------------------------- */

enum SystemDefines
{
    ADC_SAMPLE_RATE_MS         = 20U,    // 50Hz

    BACKGROUND_RATE_BUTTON_MS  = 20U,     //  50Hz
    BACKGROUND_ADC_AVG_POLL_MS = 100U,    //  10Hz

};

/* -------------------------------------------------------------------------- */

enum CommunicationDefines
{
    PC_BAUD = 500000,
    IMU_BAUD      = 921600,
    EXTERNAL_BAUD = 115200,
};

/* -------------------------------------------------------------------------- */


/* ----------------------- End --------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /* APP_TIMES_H */
