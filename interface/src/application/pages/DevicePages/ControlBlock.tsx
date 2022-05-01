import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
} from '@electricui/components-desktop-charts'

import {
  Card,
  Icon,
  Colors,
  Tag,
  Intent,
  IconName,
  Tooltip,
  Callout,
} from '@blueprintjs/core'
import { Composition, Box } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import { PolledCSVLogger } from '@electricui/components-desktop-blueprint-loggers'
import { MessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import {
  Slider,
  Dropdown,
  NumberInput,
  TextInput,
} from '@electricui/components-desktop-blueprint'
import { Printer } from '@electricui/components-desktop'
import { IconNames } from '@blueprintjs/icons'
import { MSGID } from 'src/application/typedState'

const layoutDescription = `
          Filter Filter Filter
          Accel Gyro Mag
        `

export const ClippingStatus = () => {
  const filter_ok = useHardwareState<boolean>(
    hwState => hwState.ok.filter_valid,
  )!

  const clip_acc_x = useHardwareState<boolean>(
    hwState => hwState.ok.clip_acc_x,
  )!
  const clip_acc_y = useHardwareState<boolean>(
    hwState => hwState.ok.clip_acc_y,
  )!
  const clip_acc_z = useHardwareState<boolean>(
    hwState => hwState.ok.clip_acc_z,
  )!

  const accelerometer_clipping: boolean = clip_acc_x || clip_acc_y || clip_acc_z

  const clip_gyro_x = useHardwareState<boolean>(
    hwState => hwState.ok.clip_gyro_x,
  )!
  const clip_gyro_y = useHardwareState<boolean>(
    hwState => hwState.ok.clip_gyro_y,
  )!
  const clip_gyro_z = useHardwareState<boolean>(
    hwState => hwState.ok.clip_gyro_z,
  )!

  const gyroscope_clipping: boolean = clip_gyro_x || clip_gyro_y || clip_gyro_z

  const clip_mag_x = useHardwareState<boolean>(
    hwState => hwState.ok.clip_mag_x,
  )!
  const clip_mag_y = useHardwareState<boolean>(
    hwState => hwState.ok.clip_mag_y,
  )!
  const clip_mag_z = useHardwareState<boolean>(
    hwState => hwState.ok.clip_mag_z,
  )!

  const magnetic_clipping: boolean = clip_mag_x || clip_mag_y || clip_mag_z

  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10}>
        {Areas => (
          <React.Fragment>
            <Areas.Filter>
              <Tag
                fill
                large
                intent={filter_ok ? Intent.SUCCESS : Intent.WARNING}
                rightIcon={filter_ok ? IconNames.TICK : IconNames.CROSS}
              >
                <div style={{ textAlign: 'center' }}>Motion Estimation</div>
              </Tag>
            </Areas.Filter>
            <Areas.Accel>
              <Tag
                large
                minimal
                intent={
                  accelerometer_clipping ? Intent.WARNING : Intent.SUCCESS
                }
                rightIcon={
                  accelerometer_clipping
                    ? IconNames.SMALL_CROSS
                    : IconNames.SMALL_TICK
                }
              >
                ACCEL
              </Tag>
            </Areas.Accel>
            <Areas.Gyro>
              <Tag
                large
                minimal
                intent={gyroscope_clipping ? Intent.WARNING : Intent.SUCCESS}
                rightIcon={
                  gyroscope_clipping
                    ? IconNames.SMALL_CROSS
                    : IconNames.SMALL_TICK
                }
              >
                GYRO
              </Tag>
            </Areas.Gyro>
            <Areas.Mag>
              <Tag
                large
                minimal
                intent={magnetic_clipping ? Intent.WARNING : Intent.SUCCESS}
                rightIcon={
                  magnetic_clipping
                    ? IconNames.SMALL_CROSS
                    : IconNames.SMALL_TICK
                }
              >
                MAG
              </Tag>
            </Areas.Mag>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}

const CPUStatus = () => {
  return (
    <React.Fragment>
      <Callout title="Microcontroller Info" icon="pulse">
        <Composition templateCols="1fr 1fr">
          <Box>CPU</Box>
          <Box>
            <Printer accessor={state => state[MSGID.SYSTEM_STATUS].cpu_load} precision={1} />% @{' '}
            <Printer accessor={state => state[MSGID.SYSTEM_STATUS].cpu_clock} precision={1} />{' '}
            MHz
          </Box>
          <Box></Box>
          <Box>
            <br />
          </Box>
          <Box>Branch</Box>
          <Box>
            <Printer accessor={state => state[MSGID.FIRMWARE_BUILD].branch} />
          </Box>
          <Box>Date</Box>
          <Box>
            <Printer accessor={state => state[MSGID.FIRMWARE_BUILD].date} />
          </Box>
          <Box>Hash</Box>
          <Box>
            <Printer accessor={state => state[MSGID.FIRMWARE_BUILD].info} />
          </Box>
        </Composition>
      </Callout>
    </React.Fragment>
  )
}

const TemperaturePressure = () => {
  return (
    <React.Fragment>
      <Callout title="xsens MTi-300" icon="cube">
        <Composition templateCols="1fr 1fr">
          <Box>Hardware</Box>
          <Box>2.0 </Box>
          <Box>Firmware</Box>
          <Box>1.8.x </Box>
          <Box> </Box>

          <Box>
            <br />
          </Box>

          <Box>Self-Test</Box>
          <Box>
            <Printer accessor={state => (state[MSGID.IMU_STATUS].self_test ? 'OK' : 'FAIL')} />
          </Box>

          <Box>Time (Fine)</Box>
          <Box>xxx </Box>
          <Box>Temperature</Box>
          <Box>
            <Printer accessor={MSGID.IMU_TEMPERATURE} precision={1} /> °C
          </Box>
          <Box>Pressure</Box>
          <Box>
            <Printer accessor={state => state[MSGID.IMU_PRESSURE] / 100} precision={1} /> hPa
          </Box>
        </Composition>
      </Callout>
    </React.Fragment>
  )
}

const accDS = new MessageDataSource(MSGID.IMU_ACC)
const fraccDS = new MessageDataSource(MSGID.IMU_FREE_ACC)
const rotDS = new MessageDataSource(MSGID.IMU_ROT)
const quatDS = new MessageDataSource(MSGID.IMU_POSE_QUAT)
const tempDS = new MessageDataSource(MSGID.IMU_TEMPERATURE)
const baroDS = new MessageDataSource(MSGID.IMU_PRESSURE)
const statusDS = new MessageDataSource(MSGID.IMU_STATUS)

const LoggingControls = () => {
  return (
    <React.Fragment>
      <PolledCSVLogger
        interval={10}
        columns={[
          {
            dataSource: quatDS,
            column: 'pitch',
            accessor: event => event.pitch,
          },
          { dataSource: quatDS, column: 'roll', accessor: event => event.roll },
          {
            dataSource: quatDS,
            column: 'heading',
            accessor: event => event.heading,
          },

          { dataSource: quatDS, column: 'q0', accessor: event => event.q0 },
          { dataSource: quatDS, column: 'q1', accessor: event => event.q1 },
          { dataSource: quatDS, column: 'q2', accessor: event => event.q2 },
          { dataSource: quatDS, column: 'q3', accessor: event => event.q3 },

          { dataSource: accDS, column: 'accX', accessor: event => event[0] },
          { dataSource: accDS, column: 'accY', accessor: event => event[1] },
          { dataSource: accDS, column: 'accZ', accessor: event => event[2] },

          {
            dataSource: fraccDS,
            column: 'freeaccX',
            accessor: event => event[0],
          },
          {
            dataSource: fraccDS,
            column: 'freeaccY',
            accessor: event => event[1],
          },
          {
            dataSource: fraccDS,
            column: 'freeaccZ',
            accessor: event => event[2],
          },

          { dataSource: rotDS, column: 'rotX', accessor: event => event[0] },
          { dataSource: rotDS, column: 'rotY', accessor: event => event[1] },
          { dataSource: rotDS, column: 'rotZ', accessor: event => event[2] },

          { dataSource: tempDS, column: 'imuTemp', accessor: event => event },
          { dataSource: baroDS, column: 'pressure', accessor: event => event },

          {
            dataSource: statusDS,
            column: 'status_filter',
            accessor: event => event.filter_ok,
          },
          {
            dataSource: statusDS,
            column: 'status_clipping',
            accessor: event => event.clipping,
          },
          {
            dataSource: statusDS,
            column: 'clip_accX',
            accessor: event => event.clip_acc_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_accY',
            accessor: event => event.clip_acc_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_accZ',
            accessor: event => event.clip_acc_z,
          },
          {
            dataSource: statusDS,
            column: 'clip_gyroX',
            accessor: event => event.clip_gyro_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_gyroY',
            accessor: event => event.clip_gyro_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_gyroZ',
            accessor: event => event.clip_gyro_z,
          },
          {
            dataSource: statusDS,
            column: 'clip_magX',
            accessor: event => event.clip_mag_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_magY',
            accessor: event => event.clip_mag_x,
          },
          {
            dataSource: statusDS,
            column: 'clip_magZ',
            accessor: event => event.clip_mag_z,
          },
        ]}
      />
    </React.Fragment>
  )
}

export const ControlBlock = () => {
  return (
    <React.Fragment>
      <IntervalRequester variable="sys" interval={250} />

      <Composition gap={10} autoCols="1fr">
        <CPUStatus />
        <TemperaturePressure />
        <br />
        <Card>
          <LoggingControls />
        </Card>
        <Card>
          <ClippingStatus />
        </Card>
      </Composition>
    </React.Fragment>
  )
}
