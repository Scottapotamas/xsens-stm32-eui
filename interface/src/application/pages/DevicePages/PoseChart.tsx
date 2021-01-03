import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
} from '@electricui/components-desktop-charts'

import { Event } from '@electricui/timeseries'

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
        Title Legend
        Chart Chart
      `

// const poseDS = new MessageDataSource('pose')

function convert_quaternion_to_euler(quat: number[]): number[] {
  let euler: number[] = [0, 0, 0]

  const w: number = quat[0]
  const x: number = quat[1]
  const y: number = quat[2]
  const z: number = quat[3]

  const sinr_cosp: number = 2 * (w * x + y * z)
  const cosr_cosp: number = 1 - 2 * (x * x + y * y)

  // Roll
  euler[0] = Math.atan2(sinr_cosp, cosr_cosp)

  // Pitch: y-axis
  const sinp: number = 2 * (w * y - z * x)

  if (Math.abs(sinp) >= 1) {
    euler[1] = (Math.PI / 2) * Math.sign(sinp) // use 90 degrees if out of range
  } else {
    euler[1] = Math.asin(sinp)
  }

  // Yaw: z-axis
  const siny_cosp: number = 2 * (w * z + x * y)
  const cosy_cosp: number = 1 - 2 * (y * y + z * z)
  euler[2] = Math.atan2(siny_cosp, cosy_cosp)

  return euler
}

// Datasource which converts from a quaternion to euler angles
const poseDS = new MessageDataSource('quat', (message, emit) => {
  const euler: number[] = convert_quaternion_to_euler(message.payload)

  const event = new Event(message.metadata.timestamp, {
    pitch: euler[0] * (180 / Math.PI),
    roll: euler[1] * (180 / Math.PI),
    yaw: euler[2] * (180 / Math.PI),
  })

  // Emit the event
  emit(event)
})

export const PoseChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>AHRS</b>
              </div>
            </Areas.Title>
            <Areas.Legend>
              <Composition
                templateCols="auto auto auto"
                justifyContent="end"
                justifyItems="end"
                gapCol={10}
              >
                <Tag intent={Intent.SUCCESS} minimal fill>
                  <b>Pitch:</b>{' '}
                  <Printer accessor={state => state.pose[0]} precision={2} />
                </Tag>
                <Tag intent={Intent.PRIMARY} minimal fill>
                  <b>Roll:</b>{' '}
                  <Printer accessor={state => state.pose[1]} precision={2} />
                </Tag>
                <Tag intent={Intent.DANGER} minimal fill>
                  <b>Yaw:</b>{' '}
                  <Printer accessor={state => state.pose[2]} precision={2} />
                </Tag>
              </Composition>
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer>
                {/* height="12vh" */}
                <LineChart
                  dataSource={poseDS}
                  accessor={event => event.pitch}
                  color={Colors.GREEN4}
                />
                <LineChart
                  dataSource={poseDS}
                  accessor={event => event.roll}
                  color={Colors.BLUE4}
                />
                <LineChart
                  dataSource={poseDS}
                  accessor={event => event.yaw}
                  color={Colors.RED4}
                />
                <RealTimeDomain window={10000} />
                <TimeAxis />
                <VerticalAxis />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
