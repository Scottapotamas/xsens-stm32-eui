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

import { MSGID, PoseConverted } from '../../typedState'

const layoutDescription = `
        Title Legend
        Chart Chart
      `

const poseDS = new MessageDataSource(MSGID.IMU_POSE_QUAT)

export const PoseChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div
                style={{
                  textAlign: 'left',
                  marginLeft: '4em',
                  marginTop: '1em',
                }}
              >
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
                <Tag intent={Intent.SUCCESS} fill>
                  <b>Pitch: </b>
                  <Printer
                    accessor={state => state[MSGID.IMU_POSE_QUAT].pitch}
                    precision={1}
                    style={{
                      width: '2.8em',
                      height: '1em',
                      overflow: 'hidden',
                      contain: 'strict',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  />
                </Tag>
                <Tag intent={Intent.PRIMARY} fill>
                  <b>Roll: </b>
                  <Printer
                    accessor={state => state[MSGID.IMU_POSE_QUAT].roll}
                    precision={1}
                    style={{
                      width: '2.8em',
                      height: '1em',
                      overflow: 'hidden',
                      contain: 'strict',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  />
                </Tag>
                <Tag intent={Intent.DANGER} fill>
                  <b>Yaw: </b>
                  <Printer
                    accessor={state => state[MSGID.IMU_POSE_QUAT].heading}
                    precision={1}
                    style={{
                      width: '2.8em',
                      height: '1em',
                      overflow: 'hidden',
                      contain: 'strict',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  />
                </Tag>
              </Composition>
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer height="30vh">
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
                  accessor={event => event.heading}
                  color={Colors.RED4}
                />
                <RealTimeDomain window={10000} />
                <TimeAxis />
                <VerticalAxis label="Angle °" />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
