#ifndef CONFIGURATION_H
#define CONFIGURATION_H

#ifdef __cplusplus
extern "C" {
#endif

/* ----- System Includes ---------------------------------------------------- */

/* ----- Local Includes ----------------------------------------------------- */

#include "global.h"
#include <src/electricui.h>

/* ----- Defines ------------------------------------------------------------ */






/* ----- Public Functions --------------------------------------------------- */

PUBLIC void
configuration_init( void );

PUBLIC void
configuration_set_defaults( void );

PUBLIC void
configuration_electric_setup( void );

PUBLIC void
configuration_eui_callback( uint8_t link, eui_interface_t *interface, uint8_t message );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_reset_cause( const char *reset_description );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_report_error( char *error_string );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_cpu_load( uint8_t percent );

PUBLIC void
config_set_cpu_clock( uint32_t clock );

PUBLIC void
config_update_task_statistics( void );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_sensors_enabled( bool enable );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_main_state( uint8_t state );


/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_temp_cpu( float temp );

/* -------------------------------------------------------------------------- */

PUBLIC void
config_update_pose( float p, float r, float y );

PUBLIC void
config_update_acceleration( float x, float y, float z );

PUBLIC void
config_update_free_acceleration( float x, float y, float z );

PUBLIC void
config_update_rate_of_turn( float x, float y, float z );

PUBLIC void
config_update_magnetometer( float x, float y, float z );

PUBLIC void
config_update_pressure( uint32_t pressure );

PUBLIC void
config_update_imu_temperature( float temp );

PUBLIC void
config_update_imu_status_fields( uint32_t word );

/* ----- End ---------------------------------------------------------------- */

#ifdef __cplusplus
}
#endif

#endif /* CONFIGURATION_H */
