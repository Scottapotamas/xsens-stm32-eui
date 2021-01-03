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

const layoutDescription = `
        Title Legend
        Chart Chart
      `

const accDS = new MessageDataSource('acc')

const ClippingLegend = () => {
  const clip_x = useHardwareState<boolean>(hwState => hwState.ok.clip_acc_x)!
  const clip_y = useHardwareState<boolean>(hwState => hwState.ok.clip_acc_y)!
  const clip_z = useHardwareState<boolean>(hwState => hwState.ok.clip_acc_z)!

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
          <div
            style={{
              width: '2.75em',
              textAlign: 'right',
              display: 'inline-block',
            }}
          >
            <Printer accessor={state => state.acc[0]} precision={1} />
          </div>
        </Tag>
        <Tag intent={Intent.PRIMARY} minimal={clip_y} fill>
          <b>Y:</b>
          <div
            style={{
              width: '2.75em',
              textAlign: 'right',
              display: 'inline-block',
            }}
          >
            <Printer accessor={state => state.acc[1]} precision={1} />
          </div>
        </Tag>
        <Tag intent={Intent.DANGER} minimal={clip_z} fill>
          <b>Z: </b>
          <div
            style={{
              width: '2.75em',
              textAlign: 'right',
              display: 'inline-block',
            }}
          >
            <Printer accessor={state => state.acc[2]} precision={1} />
          </div>
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
              <ChartContainer height="300px">
                {/* height="12vh" */}
                <TimeSlicedLineChart
                  dataSource={accDS}
                  xAccessor={event => event[1]}
                  yAccessor={event => event[0]}
                  color={Colors.GOLD4}
                  lineWidth={4}
                />
                <RealTimeSlicingDomain
                  window={500}
                  xMin={-15}
                  xMax={15}
                  yMin={-15}
                  yMax={15}
                />
                <Fog color="#191b1d" />
                {/* 
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[0]}
                  color={Colors.GREEN4}
                />
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[1]}
                  color={Colors.BLUE4}
                />
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[2]}
                  color={Colors.RED4}
                />
                <RealTimeDomain window={10000} />
                 */}
                {/* <TimeAxis /> */}
                <HorizontalAxis />
                <VerticalAxis />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
