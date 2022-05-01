import {
  ChartContainer,
  LineChart,
  RealTimeDomain,
  TimeAxis,
  VerticalAxis,
  HorizontalAxis,
  TimeSlicedLineChart,
  RealTimeSlicingDomain,
  BlankingLineChart,
  TriggerDomain,
  VerticalAnnotation,
} from '@electricui/components-desktop-charts'
import { Event } from '@electricui/timeseries'

import { Colors, Tag } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import { MessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import { IconNames } from '@blueprintjs/icons'
import { MSGID } from 'src/application/typedState'

const layoutDescription = `
        Title
        Chart
      `

const accDS = new MessageDataSource(MSGID.IMU_ACC)

let triggerMax: number = 0
const triggerMaxDecay: number = 0.1
const triggerThreshold: number = 5

let lastTrigger: number = 0

// Datasource which emits true when a strong acceleration occured
const triggerDS = new MessageDataSource('acc', (message, emit) => {
  // Debounce - only consider an event if we haven't recently done so
  if (message.metadata.timestamp - lastTrigger > 3000) {
    // Adaptive thresholding - only consider magnitudes larger than a previous max
    if (Math.abs(message.payload[0]) > triggerMax) {
      // Set the new maximum slightly higher than this one
      triggerMax = Math.abs(message.payload[0]) + triggerMaxDecay
      lastTrigger = message.metadata.timestamp

      // Generate the trigger event
      const event = new Event(message.metadata.timestamp + 700, 1)
      emit(event)
    } else {
      // it's been several seconds since an event, reduce the threshold
      if (triggerMax > triggerThreshold) {
        triggerMax -= triggerMaxDecay
      }
    }
  }
})

export const AccelerationHighlightChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>SIGNIFICANT ACCELERATION TRACE</b>
              </div>
            </Areas.Title>

            <Areas.Chart>
              <ChartContainer height="30vh">
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[0]}
                  color={Colors.GREEN5}
                  lineWidth={2}
                />
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[1]}
                  color={Colors.BLUE1}
                  lineWidth={1}
                />
                <LineChart
                  dataSource={accDS}
                  accessor={event => event[2]}
                  color={Colors.RED1}
                  lineWidth={1}
                />

                <VerticalAnnotation
                  dataSource={triggerDS}
                  accessor={(event, time) => time - 700}
                  color={Colors.LIGHT_GRAY4}
                  lineWidth={1}
                />

                <HorizontalAxis
                  tickFormat={(tick: number, index: number, ticks: number[]) =>
                    `${tick / 1000}s`
                  }
                />
                <VerticalAxis label="Acceleration m/s²" tickCount={10} />
                <TriggerDomain
                  window={1000}
                  dataSource={triggerDS}
                  accessor={(event, time) => time}
                  yMin={-20}
                  yMax={20}
                />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
