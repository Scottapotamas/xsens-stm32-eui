import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
  HorizontalAxis,
  TimeSlicedLineChart,
  RealTimeSlicingDomain,
  Fog,
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
import { MSGID } from 'src/application/typedState'

const layoutDescription = `
        Title Legend
        Chart Chart
      `

const accDS = new MessageDataSource(MSGID.IMU_ACC)

const ClippingLegend = () => {
  const clip_x = useHardwareState<boolean>(hwState => hwState[MSGID.IMU_STATUS].clip_acc_x)!
  const clip_y = useHardwareState<boolean>(hwState => hwState[MSGID.IMU_STATUS].clip_acc_y)!
  const clip_z = useHardwareState<boolean>(hwState => hwState[MSGID.IMU_STATUS].clip_acc_z)!

  return (
    <React.Fragment>
      <Composition
        templateCols="auto auto auto"
        justifyContent="end"
        justifyItems="end"
        gapCol={10}
      >
        <Tag intent={Intent.SUCCESS} minimal={clip_x} fill>
          <b>X:</b>
          <Printer
            accessor={state => state[MSGID.IMU_ACC][0]}
            precision={1}
            style={{
              width: '2.2em',
              height: '1em',
              overflow: 'hidden',
              contain: 'strict',
              textAlign: 'right',
              display: 'inline-block',
            }}
          />
        </Tag>
        <Tag intent={Intent.PRIMARY} minimal={clip_y} fill>
          <b>Y:</b>

          <Printer
            accessor={state => state[MSGID.IMU_ACC][1]}
            precision={1}
            style={{
              width: '2.2em',
              height: '1em',
              overflow: 'hidden',
              contain: 'strict',
              textAlign: 'right',
              display: 'inline-block',
            }}
          />
        </Tag>
        <Tag intent={Intent.DANGER} minimal={clip_z} fill>
          <b>Z: </b>
          <Printer
            accessor={state => state[MSGID.IMU_ACC][2]}
            precision={1}
            style={{
              width: '2.2em',
              height: '1em',
              overflow: 'hidden',
              contain: 'strict',
              textAlign: 'right',
              display: 'inline-block',
            }}
          />
        </Tag>
      </Composition>
    </React.Fragment>
  )
}

export const AccelerationChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>ACCELERATION</b>
              </div>
            </Areas.Title>
            <Areas.Legend>
              <ClippingLegend />
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer height="25vh">
                <TimeSlicedLineChart
                  dataSource={accDS}
                  xAccessor={event => event[1]}
                  yAccessor={event => event[0]}
                  color={Colors.GOLD4}
                  lineWidth={4}
                />
                <RealTimeSlicingDomain
                  window={500}
                  xMin={-10}
                  xMax={10}
                  yMin={-10}
                  yMax={10}
                />
                <Fog color="#191b1d" />
                <HorizontalAxis label="Latitudinal m/s²" />
                <VerticalAxis label="Longitudinal m/s²" />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
