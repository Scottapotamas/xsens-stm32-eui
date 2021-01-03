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
} from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import { MessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import { RouteComponentProps } from '@reach/router'
import {
  Slider,
  Dropdown,
  NumberInput,
  TextInput,
} from '@electricui/components-desktop-blueprint'
import { Printer } from '@electricui/components-desktop'
import { IconNames } from '@blueprintjs/icons'

const layoutDescription = `
          Filter Filter Filter
          Accel Gyro Mag
        `

export const ClippingStatus = () => {
  const filter_ok = useHardwareState<boolean>(hwState => hwState.ok.filter_ok)!

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
                intent={filter_ok ? Intent.WARNING : Intent.SUCCESS}
                rightIcon={filter_ok ? IconNames.CROSS : IconNames.TICK}
              >
                <div style={{ textAlign: 'center' }}>Motion Fusion</div>
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

export const ControlBlock = () => {
  return (
    <React.Fragment>
      <IntervalRequester variable="sys" interval={250} />

      <Composition gap={10} autoCols="1fr">
        <h3>IMU Info</h3>
        <ClippingStatus />
      </Composition>
    </React.Fragment>
  )
}
