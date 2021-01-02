#include <string.h>

/* ----- Local Includes ----------------------------------------------------- */

#include "configuration.h"
#include "electricui.h"

#include "app_task_ids.h"
#include "app_tasks.h"

#include "app_events.h"
#include "app_signals.h"
#include "app_times.h"
#include "app_version.h"
#include "event_subscribe.h"
#include "hal_uuid.h"

typedef struct
{
    // Microcontroller info
    uint8_t cpu_load;     //percentage
    uint8_t cpu_clock;    //speed in Mhz

} SystemData_t;

typedef struct
{
    char build_branch[12];
    char build_info[12];
    char build_date[12];
    char build_time[12];
    char build_type[12];
    char build_name[12];
} BuildInfo_t;

typedef struct
{
    uint8_t  id;    // index of the task (pseudo priority)
    uint8_t  ready;
    uint8_t  queue_used;
    uint8_t  queue_max;
    uint32_t waiting_max;
    uint32_t burst_max;
    char     name[12];    // human readable taskname set during app_tasks setup
} Task_Info_t;

SystemData_t     sys_stats;
BuildInfo_t      fw_info;
Task_Info_t      task_info[TASK_MAX] = { 0 };

float cpu_temp;
char device_nickname[16] = "xsens-mti";
char reset_cause[20]     = "No Reset Cause";

uint32_t sensor_status = { 0 };

// IMU data
float pry[3] = { 0 };
float acceleration[3] = { 0 };
float free_acceleration[3] = { 0 };
float rate_of_turn[3] = { 0 };
float magnetics[3] = { 0 };
uint32_t imu_pressure = 0;
float imu_temperature = 0;

eui_message_t ui_variables[] = {
    // Higher level system setup information
    EUI_CHAR_ARRAY_RO( "name", device_nickname ),
    EUI_CHAR_ARRAY_RO( "reset_type", reset_cause ),
    EUI_CUSTOM( "sys", sys_stats ),
    EUI_CUSTOM( "fwb", fw_info ),
    EUI_CUSTOM( "tasks", task_info ),

    EUI_FLOAT_ARRAY_RO( "pose", pry ),
    EUI_FLOAT_ARRAY_RO( "acc", acceleration ),
    EUI_FLOAT_ARRAY_RO( "fracc", free_acceleration ),
    EUI_FLOAT_ARRAY_RO( "rot", rate_of_turn ),
    EUI_FLOAT_ARRAY_RO( "mag", magnetics ),
    EUI_UINT32_RO( "baro", imu_pressure ),
    EUI_FLOAT_RO( "temp", imu_temperature ),
    EUI_CUSTOM_RO( "ok", sensor_status),
};

/* ----- Public Functions --------------------------------------------------- */

PUBLIC void
configuration_init( void )
{
    //perform any setup here if needed
    configuration_set_defaults();

    // Load settings from flash memory
    //    configuration_load();
}

/* -------------------------------------------------------------------------- */

PUBLIC void
configuration_set_defaults( void )
{
    //set build info to hardcoded values
    memset( &fw_info.build_branch, 0, sizeof( fw_info.build_branch ) );
    memset( &fw_info.build_info, 0, sizeof( fw_info.build_info ) );
    memset( &fw_info.build_date, 0, sizeof( fw_info.build_date ) );
    memset( &fw_info.build_time, 0, sizeof( fw_info.build_time ) );
    memset( &fw_info.build_type, 0, sizeof( fw_info.build_type ) );
    memset( &fw_info.build_name, 0, sizeof( fw_info.build_name ) );

    strcpy( (char *)&fw_info.build_branch, ProgramBuildBranch );
    strcpy( (char *)&fw_info.build_info, ProgramBuildInfo );
    strcpy( (char *)&fw_info.build_date, ProgramBuildDate );
    strcpy( (char *)&fw_info.build_time, ProgramBuildTime );
    strcpy( (char *)&fw_info.build_type, ProgramBuildType );
    strcpy( (char *)&fw_info.build_name, ProgramName );
}

/* -------------------------------------------------------------------------- */

PUBLIC void
configuration_electric_setup( void )
{
    EUI_TRACK( ui_variables );
    eui_setup_identifier( (char *)HAL_UUID, 12 );    //header byte is 96-bit, therefore 12-bytes
}

PUBLIC void
configuration_eui_callback( uint8_t link, eui_interface_t *interface, uint8_t message )
{
    // Provided the callbacks - use this to fire callbacks when a variable changes etc
    switch( message )
    {
        case EUI_CB_TRACKED: {
            // UI received a tracked message ID and has completed processing
            eui_header_t header  = interface->packet.header;
            void *       payload = interface->packet.data_in;
            uint8_t *    name_rx = interface->packet.id_in;

            // See if the inbound packet name matches our intended variable
            if( strcmp( (char *)name_rx, "h" ) == 0 )
            {
              // got a UI heartbeat
            }

            break;
        }

        case EUI_CB_UNTRACKED:
            // UI passed in an untracked message ID
            break;

        case EUI_CB_PARSE_FAIL:
            // Inbound message parsing failed, this callback help while debugging
            break;

        default:
            break;
    }
}

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_reset_cause( const char *reset_description )
{
    memset( &reset_cause, 0, sizeof( reset_cause ) );
    strcpy( (char *)&reset_cause, reset_description );
}

/* -------------------------------------------------------------------------- */

PUBLIC void
config_report_error( char *error_string )
{
    // Send the text to the UI for display to user
    eui_message_t err_message = { .id   = "err",
                                  .type = TYPE_CHAR,
                                  .size = strlen( error_string ),
                                  { .data = error_string } };

    eui_send_untracked( &err_message );
}

/* -------------------------------------------------------------------------- */

// System Statistics and Settings

PUBLIC void
config_set_cpu_load( uint8_t percent )
{
    sys_stats.cpu_load = percent;
}

PUBLIC void
config_set_cpu_clock( uint32_t clock )
{
    sys_stats.cpu_clock = clock / 1000000;    //convert to Mhz
}

PUBLIC void
config_update_task_statistics( void )
{
    for( uint8_t id = ( TASK_MAX - 1 ); id > 0; id-- )
    {
        StateTask *t = app_task_by_id( id );
        if( t )
        {
            task_info[id].id          = t->id;
            task_info[id].ready       = t->ready;
            task_info[id].queue_used  = t->eventQueue.used;
            task_info[id].queue_max   = t->eventQueue.max;
            task_info[id].waiting_max = t->waiting_max;
            task_info[id].burst_max   = t->burst_max;

            memset( &task_info[id].name, 0, sizeof( task_info[0].name ) );
            strcpy( (char *)&task_info[id].name, t->name );
        }
    }
    //app_task_clear_statistics();
}

/* -------------------------------------------------------------------------- */

PUBLIC void
config_set_temp_cpu( float temp )
{
    cpu_temp = temp;
}

/* -------------------------------------------------------------------------- */

PUBLIC void
config_update_pose( float p, float r, float y )
{
    pry[0] = p;
    pry[1] = r;
    pry[2] = y;
    eui_send_tracked( "pose" );
}

PUBLIC void
config_update_acceleration( float x, float y, float z )
{
    acceleration[0] = x;
    acceleration[1] = y;
    acceleration[2] = z;
    eui_send_tracked( "acc" );
}

PUBLIC void
config_update_free_acceleration( float x, float y, float z )
{
    free_acceleration[0] = x;
    free_acceleration[1] = y;
    free_acceleration[2] = z;
    eui_send_tracked( "fracc" );
}

PUBLIC void
config_update_rate_of_turn( float x, float y, float z )
{
    rate_of_turn[0] = x;
    rate_of_turn[1] = y;
    rate_of_turn[2] = z;
    eui_send_tracked( "rot" );
}

PUBLIC void
config_update_magnetometer( float x, float y, float z )
{
    magnetics[0] = x;
    magnetics[1] = y;
    magnetics[2] = z;
    eui_send_tracked( "mag" );
}

PUBLIC void
config_update_pressure( uint32_t pressure )
{
    imu_pressure = pressure;
    eui_send_tracked( "baro" );
}

PUBLIC void
config_update_imu_temperature( float temp )
{
    imu_temperature = temp;
    eui_send_tracked( "temp" );
}


PUBLIC void
config_update_imu_status_fields( uint32_t word )
{
    // Only send if the status changes
    if( sensor_status != word )
    {
        sensor_status = word;
        eui_send_tracked( "ok" );
    }
}

/* ----- Private Functions -------------------------------------------------- */


/* ----- End ---------------------------------------------------------------- */
