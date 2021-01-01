#ifndef HAL_GPIO_H
#define HAL_GPIO_H

#ifdef __cplusplus
extern "C" {
#endif

/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "global.h"

/* ----- Defines ------------------------------------------------------------ */

/** Readability macros to remind us which is a HIGH level or LOW level */

#define GPIO_HIGH true
#define GPIO_LOW  false

/* ----- Types ------------------------------------------------------------- */

/** Operational mode for pins */

typedef enum
{
    MODE_INPUT = 0,    // Normal input
    MODE_INPUT_PU,     // Input with pullup
    MODE_INPUT_PD,     // Input with pullup
    MODE_ANALOG,       // Analog input mode
    MODE_OUT_PP,       // Push-Pull Output
    MODE_OUT_OD,       // Open drain Output
    MODE_AF_PP,        // Push-Pull alternative function
    MODE_AF_OD,        // Open-Drain alternative function
} HalGpioMode_t;

/** Enum with all the GPIO pins defined. See schematic for more detail */

typedef enum
{
    _AUX_UART_TX,
    _AUX_UART_RX,

    _EXT_INPUT_0,
    _EXT_OUTPUT_0,

    _PC_UART_RX,
    _PC_UART_TX,


    /* --- BUTTONS --- */
    _BTN_0,
    _BTN_1,

    /* --- STATUS LEDS --- */
    _STATUS_0,
    _STATUS_1,
    _STATUS_2,
    _STATUS_3,

    /* --- Defining Total Entries --- */
    _NUMBER_OF_GPIO_PORT_PINS

} HalGpioPortPin_t;

/* -------------------------------------------------------------------------- */

/** Configure all internal default I/O configurations */

PUBLIC void
hal_gpio_configure_defaults( void );

/* -------------------------------------------------------------------------- */

/** Configure an indicated pin for the give mode */

PUBLIC void
hal_gpio_init( HalGpioPortPin_t gpio_port_pin_nr, HalGpioMode_t mode, bool initial );

/* -------------------------------------------------------------------------- */

/** Allow more manual configuration of alternative functions, while wrapping the pin/port def */

PUBLIC void
hal_gpio_init_alternate( HalGpioPortPin_t gpio_port_pin_nr, uint32_t alternative_function, uint32_t speed,
                         uint32_t pull );

/* -------------------------------------------------------------------------- */

/** Return true when input pin is high, false when input is low */

PUBLIC bool
hal_gpio_read_pin( HalGpioPortPin_t gpio_port_pin_nr );

/* -------------------------------------------------------------------------- */

/** Set output pin high when on = true, low when on = false */

PUBLIC void
hal_gpio_write_pin( HalGpioPortPin_t gpio_port_pin_nr, bool on );

/* -------------------------------------------------------------------------- */

/** Toggle the current output state */

PUBLIC void
hal_gpio_toggle_pin( HalGpioPortPin_t gpio_port_pin_nr );

/* -------------------------------------------------------------------------- */

/** Disable pin */

PUBLIC void
hal_gpio_disable_pin( HalGpioPortPin_t gpio_port_pin_nr );

/* ----- End ---------------------------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /* HAL_GPIO_H */
