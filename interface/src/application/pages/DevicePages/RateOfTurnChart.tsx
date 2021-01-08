import {
  ChartContainer,
  HorizontalAnnotation,
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

const rateOfTurnDS = new MessageDataSource('rot')

const clipAnnotationDS = new MessageDataSource('ok', (message, emit) => {
  // Build the event at the current time
  if (
    message.payload.clip_gyro_x ||
    message.payload.clip_gyro_y ||
    message.payload.clip_gyro_z
  ) {
    const event = new Event(message.metadata.timestamp, 5)
    // Emit the event
    emit(event)
  }
})

const ClippingLegend = () => {
  const clip_x = useHardwareState<boolean>(hwState => hwState.ok.clip_gyro_x)!
  const clip_y = useHardwareState<boolean>(hwState => hwState.ok.clip_gyro_y)!
  const clip_z = useHardwareState<boolean>(hwState => hwState.ok.clip_gyro_z)!

  return (
    <React.Fragment>
      <Composition
        templateCols="auto auto auto"
        justifyContent="end"
        justifyItems="end"
        gapCol={10}
      >
        <Tag intent={Intent.SUCCESS} minimal={clip_x} fill>
          <b>Pitch: </b>
          <Printer
            accessor={state => state.rot[1]}
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
          <b>Roll: </b> {}
          <Printer
            accessor={state => state.rot[0]}
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
          <b>Yaw: </b>
          <Printer
            accessor={state => state.rot[2]}
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

export const RateOfTurnChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>RATE OF TURN</b>
              </div>
            </Areas.Title>
            <Areas.Legend>
              <ClippingLegend />
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer height="30vh">
                <LineChart
                  dataSource={rateOfTurnDS}
                  accessor={event => event[1] * (180 / Math.PI)}
                  color={Colors.GREEN4}
                />
                <LineChart
                  dataSource={rateOfTurnDS}
                  accessor={event => event[0] * (180 / Math.PI)}
                  color={Colors.BLUE4}
                />
                <LineChart
                  dataSource={rateOfTurnDS}
                  accessor={event => event[2] * (180 / Math.PI)}
                  color={Colors.RED4}
                />
                <HorizontalAnnotation y={450} color={Colors.VIOLET2} />
                <HorizontalAnnotation y={-450} color={Colors.VIOLET2} />

                <RealTimeDomain window={10000} />
                <TimeAxis />
                <VerticalAxis label="deg/second" />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
