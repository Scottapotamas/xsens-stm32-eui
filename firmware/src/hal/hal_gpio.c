/* ----- System Includes ---------------------------------------------------- */

#include "stm32f4xx_ll_bus.h"
#include "stm32f4xx_ll_gpio.h"
#include "stm32f4xx_ll_pwr.h"

/* ----- Local Includes ----------------------------------------------------- */

#include "hal_gpio.h"
#include "hal_gpio_types.h"
#include "qassert.h"

/* ----- Private Function Declarations -------------------------------------- */

/** Map the port nr to a STM32 GPIO_TypeDef */

PRIVATE GPIO_TypeDef *
hal_gpio_mcu_port( HalGpioPortNr_t port_nr );

/** Map the pin nr to a STM32 LL_PIN */

PRIVATE uint32_t
hal_gpio_mcu_pin( HalGpioPinNr_t pin_nr );

/** Enable peripheral clock */

PRIVATE void
hal_gpio_mcu_rcc_clock_enable( const HalGpioPortNr_t port_nr );

/** Init as analog input */

PRIVATE void
hal_gpio_init_as_analog( HalGpioPortNr_t port_nr,
                         HalGpioPinNr_t  pin_nr );

/** Init as input */

PRIVATE void
hal_gpio_init_as_input( HalGpioPortNr_t port_nr,
                        HalGpioPinNr_t  pin_nr );

/** Init as input with pullup */

PRIVATE void
hal_gpio_init_as_input_with_pullup( HalGpioPortNr_t port_nr,
                                    HalGpioPinNr_t  pin_nr );

/** Init as input with pulldown */

PRIVATE void
hal_gpio_init_as_input_with_pulldown( HalGpioPortNr_t port_nr,
                                      HalGpioPinNr_t  pin_nr );

/** Init as open drain output */

PRIVATE void
hal_gpio_init_as_output_od( HalGpioPortNr_t port_nr,
                            HalGpioPinNr_t  pin_nr,
                            bool            initial_state );

/** Init as push pull output */

PRIVATE void
hal_gpio_init_as_output_pp( HalGpioPortNr_t port_nr,
                            HalGpioPinNr_t  pin_nr,
                            bool            initial_state );

/** De-init */

PRIVATE void
hal_gpio_deinit( HalGpioPortNr_t port_nr,
                 HalGpioPinNr_t  pin_nr );

/* ----- Private Data ------------------------------------------------------- */

DEFINE_THIS_FILE; /* Used for ASSERT checks to define __FILE__ only once */

/* -----  I/O Map ----------------------------------------------------------- */

/** For our own HAL GPIO layer, define enum labels that incorporate
 *  port and pin numbers combined in the one enum label.
 *  Port numbers are in the high byte and pin number are in the low byte
 */
const HalGpioDef_t HalGpioHardwareMap[] = {

    [_AUX_UART_TX] = { .mode = MODE_AF_PP, .port = PORT_B, .pin = PIN_6, .initial = 0 },
    [_AUX_UART_RX] = { .mode = MODE_AF_PP, .port = PORT_B, .pin = PIN_7, .initial = 0 },

    /* --- EXTERNAL EXPANSION IO --- */
    [_EXT_INPUT_0]  = { .mode = MODE_INPUT, .port = PORT_D, .pin = PIN_2, .initial = 0 },
    [_EXT_OUTPUT_0] = { .mode = MODE_OUT_PP, .port = PORT_C, .pin = PIN_12, .initial = 0 },

    /* --- EXPANSION CARD --- */
    [_PC_UART_RX]  = { .mode = MODE_AF_PP, .port = PORT_D, .pin = PIN_6, .initial = 0 },
    [_PC_UART_TX]  = { .mode = MODE_AF_PP, .port = PORT_D, .pin = PIN_5, .initial = 0 },

    /* --- BUTTONS --- */
    [_BTN_0] = { .mode = MODE_INPUT_PD, .port = PORT_A, .pin = PIN_0, .initial = 0 },
    [_BTN_1] = { .mode = MODE_INPUT_PD, .port = PORT_A, .pin = PIN_1, .initial = 0 },

    /* --- STATUS LEDS --- */
    [_STATUS_0] = { .mode = MODE_OUT_PP, .port = PORT_D, .pin = PIN_14, .initial = 0 },
    [_STATUS_1] = { .mode = MODE_OUT_PP, .port = PORT_D, .pin = PIN_13, .initial = 0 },
    [_STATUS_2] = { .mode = MODE_OUT_PP, .port = PORT_D, .pin = PIN_12, .initial = 0 },
    [_STATUS_3] = { .mode = MODE_OUT_PP, .port = PORT_D, .pin = PIN_15, .initial = 0 },
};

/* ----- Public Function Implementations ------------------------------------ */

PUBLIC void
hal_gpio_configure_defaults( void )
{
    for( HalGpioPortPin_t portpin = 0;
         portpin < _NUMBER_OF_GPIO_PORT_PINS;
         portpin++ )
    {
        const HalGpioDef_t *m = &HalGpioHardwareMap[portpin];
        hal_gpio_init( portpin, m->mode, m->initial );
    }

    LL_PWR_DisableWakeUpPin( LL_PWR_WAKEUP_PIN1 );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure mode of pin */

PUBLIC void
hal_gpio_init( HalGpioPortPin_t gpio_port_pin_nr,
               HalGpioMode_t    mode,
               bool             initial_state )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    ENSURE( m->port <= PORT_H );
    ENSURE( m->pin <= PIN_15 );

    hal_gpio_mcu_rcc_clock_enable( m->port );

    switch( mode )
    {
        case MODE_ANALOG:
            hal_gpio_init_as_analog( m->port, m->pin );
            break;

        case MODE_INPUT:
            hal_gpio_init_as_input( m->port, m->pin );
            break;

        case MODE_INPUT_PU:
            hal_gpio_init_as_input_with_pullup( m->port, m->pin );
            break;

        case MODE_INPUT_PD:
          hal_gpio_init_as_input_with_pulldown( m->port, m->pin );
          break;

        case MODE_OUT_OD:
            hal_gpio_init_as_output_od( m->port, m->pin, initial_state );
            break;

        case MODE_OUT_PP:
            hal_gpio_init_as_output_pp( m->port, m->pin, initial_state );
            break;

        case MODE_AF_PP:
            // Expect the 'alternate mode' driver (UART, PWM etc) to setup the GPIO as required, so ignore it here
            break;
    }
}

/* -------------------------------------------------------------------------- */

PUBLIC void
hal_gpio_init_alternate( HalGpioPortPin_t gpio_port_pin_nr,
                         uint32_t         alternative_function,
                         uint32_t         speed,
                         uint32_t         pull )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    ENSURE( m->port <= PORT_H );
    ENSURE( m->pin <= PIN_15 );

    uint32_t      pin  = hal_gpio_mcu_pin( m->pin );
    GPIO_TypeDef *port = hal_gpio_mcu_port( m->port );

    hal_gpio_mcu_rcc_clock_enable( m->port );

    LL_GPIO_SetPinMode( port, pin, LL_GPIO_MODE_ALTERNATE );
    LL_GPIO_SetPinSpeed( port, pin, speed );
    LL_GPIO_SetPinPull( port, pin, pull );

    ( pin <= LL_GPIO_PIN_7 ) ? LL_GPIO_SetAFPin_0_7( port, pin, alternative_function )
                             : LL_GPIO_SetAFPin_8_15( port, pin, alternative_function );
}

/* -------------------------------------------------------------------------- */

/** @brief read the I/O pin. Return true when pin is high */

PUBLIC bool
hal_gpio_read_pin( HalGpioPortPin_t gpio_port_pin_nr )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    //return true when high
    return LL_GPIO_IsInputPinSet( hal_gpio_mcu_port( m->port ), hal_gpio_mcu_pin( m->pin ) );
}

/* -------------------------------------------------------------------------- */

/** @brief Write the I/O pin. Pin is set high when 'on' == true */

PUBLIC void
hal_gpio_write_pin( HalGpioPortPin_t gpio_port_pin_nr, bool on )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    ( on ) ? LL_GPIO_SetOutputPin( hal_gpio_mcu_port( m->port ), hal_gpio_mcu_pin( m->pin ) )
           : LL_GPIO_ResetOutputPin( hal_gpio_mcu_port( m->port ), hal_gpio_mcu_pin( m->pin ) );
}

/* -------------------------------------------------------------------------- */

/** @brief Toggle the I/O pin */

PUBLIC void
hal_gpio_toggle_pin( HalGpioPortPin_t gpio_port_pin_nr )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    LL_GPIO_TogglePin( hal_gpio_mcu_port( m->port ), hal_gpio_mcu_pin( m->pin ) );
}

/* -------------------------------------------------------------------------- */

/** @brief Disable the I/O pin */

PUBLIC void
hal_gpio_disable_pin( HalGpioPortPin_t gpio_port_pin_nr )
{
    const HalGpioDef_t *m = &HalGpioHardwareMap[gpio_port_pin_nr];

    // TODO GPIO LL de-init specific pin
    //LL_GPIO_DeInit( m->port );

    //    hal_gpio_deinit( m->port, m->pin );
}

/* ----- Private Function Implementations ----------------------------------- */

/** Map the port nr to a STM32 GPIO_TypeDef */

PRIVATE GPIO_TypeDef *
hal_gpio_mcu_port( HalGpioPortNr_t port_nr )
{
    GPIO_TypeDef *port = 0;

    switch( port_nr )
    {
        case PORT_A:
            port = GPIOA;
            break;
        case PORT_B:
            port = GPIOB;
            break;
        case PORT_C:
            port = GPIOC;
            break;
        case PORT_D:
            port = GPIOD;
            break;
        case PORT_E:
            port = GPIOE;
            break;
        case PORT_F:
            port = GPIOF;
            break;
        case PORT_G:
            port = GPIOG;
            break;
        case PORT_H:
            port = GPIOH;
            break;
        case PORT_I:
            port = GPIOI;
            break;
        default:
            ASSERT( false );
    }
    return port;
}

PRIVATE uint32_t
hal_gpio_mcu_pin( HalGpioPinNr_t pin_nr )
{
    uint32_t pin = 0;
    switch( pin_nr )
    {
        case PIN_0:
            pin = LL_GPIO_PIN_0;
            break;
        case PIN_1:
            pin = LL_GPIO_PIN_1;
            break;
        case PIN_2:
            pin = LL_GPIO_PIN_2;
            break;
        case PIN_3:
            pin = LL_GPIO_PIN_3;
            break;
        case PIN_4:
            pin = LL_GPIO_PIN_4;
            break;
        case PIN_5:
            pin = LL_GPIO_PIN_5;
            break;
        case PIN_6:
            pin = LL_GPIO_PIN_6;
            break;
        case PIN_7:
            pin = LL_GPIO_PIN_7;
            break;
        case PIN_8:
            pin = LL_GPIO_PIN_8;
            break;
        case PIN_9:
            pin = LL_GPIO_PIN_9;
            break;
        case PIN_10:
            pin = LL_GPIO_PIN_10;
            break;
        case PIN_11:
            pin = LL_GPIO_PIN_11;
            break;
        case PIN_12:
            pin = LL_GPIO_PIN_12;
            break;
        case PIN_13:
            pin = LL_GPIO_PIN_13;
            break;
        case PIN_14:
            pin = LL_GPIO_PIN_14;
            break;
        case PIN_15:
            pin = LL_GPIO_PIN_15;
            break;
        default:
            ASSERT( false );
    }
    return pin;
}
/* -------------------------------------------------------------------------- */

PRIVATE void
hal_gpio_mcu_rcc_clock_enable( const HalGpioPortNr_t port_nr )
{
    switch( port_nr )
    {
        case PORT_A:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOA );
            break;
        case PORT_B:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOB );
            break;
        case PORT_C:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOC );
            break;
        case PORT_D:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOD );
            break;
        case PORT_E:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOE );
            break;
        case PORT_F:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOF );
            break;
        case PORT_G:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOG );
            break;
        case PORT_H:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOH );
            break;
        case PORT_I:
            LL_AHB1_GRP1_EnableClock( LL_AHB1_GRP1_PERIPH_GPIOI );
            break;
        default:
            ASSERT( false );
            break;
    }
}

/* -------------------------------------------------------------------------- */

/** @brief Configure analog pin without pull up */

PRIVATE void
hal_gpio_init_as_analog( HalGpioPortNr_t port_nr,
                         HalGpioPinNr_t  pin_nr )
{
    LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_ANALOG );
    LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_NO );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure Input pin without pull up */

PRIVATE void
hal_gpio_init_as_input( HalGpioPortNr_t port_nr,
                        HalGpioPinNr_t  pin_nr )
{
    LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_INPUT );
    LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_NO );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure as Input pin with pullups */

PRIVATE void
hal_gpio_init_as_input_with_pullup( HalGpioPortNr_t port_nr,
                                    HalGpioPinNr_t  pin_nr )
{
    LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_INPUT );
    LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_UP );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure as Input pin with pulldown */

PRIVATE void
hal_gpio_init_as_input_with_pulldown( HalGpioPortNr_t port_nr,
                                      HalGpioPinNr_t  pin_nr )
{
  LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_INPUT );
  LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_DOWN );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure as output */

PRIVATE void
hal_gpio_init_as_output_od( HalGpioPortNr_t port_nr,
                            HalGpioPinNr_t  pin_nr,
                            bool            initial_state )
{
    LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_OUTPUT );
    LL_GPIO_SetPinSpeed( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_SPEED_FREQ_LOW );
    LL_GPIO_SetPinOutputType( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_OUTPUT_OPENDRAIN );
    LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_UP );

    ( initial_state ) ? LL_GPIO_SetOutputPin( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ) )
                      : LL_GPIO_ResetOutputPin( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ) );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure as output */

PRIVATE void
hal_gpio_init_as_output_pp( HalGpioPortNr_t port_nr,
                            HalGpioPinNr_t  pin_nr,
                            bool            initial_state )
{
    LL_GPIO_SetPinMode( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_MODE_OUTPUT );
    LL_GPIO_SetPinSpeed( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_SPEED_FREQ_LOW );
    LL_GPIO_SetPinOutputType( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_OUTPUT_PUSHPULL );
    LL_GPIO_SetPinPull( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ), LL_GPIO_PULL_NO );

    ( initial_state ) ? LL_GPIO_SetOutputPin( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ) )
                      : LL_GPIO_ResetOutputPin( hal_gpio_mcu_port( port_nr ), hal_gpio_mcu_pin( pin_nr ) );
}

/* -------------------------------------------------------------------------- */

/** @brief Configure as analog */

PRIVATE void
hal_gpio_deinit( HalGpioPortNr_t port_nr,
                 HalGpioPinNr_t  pin_nr )
{
    // TODO implement pin de-init/reset with LL
}

/* ----- End ---------------------------------------------------------------- */
