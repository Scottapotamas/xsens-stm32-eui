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

const layoutDescription = `
        Title
        Chart
      `

const accDS = new MessageDataSource('acc')

let triggerMax: number = 0
let lastTrigger: number = 0

// Datasource which emits true when a strong acceleration occured
// TODO: debounce timing
// TODO: peak detection to decide if event is interesting, instead of threshold
const triggerDS = new MessageDataSource('acc', (message, emit) => {
  // Debounce - only consider an event if we haven't recently
  if (message.metadata.timestamp - lastTrigger > 5000) {
    // Adaptive peak detection - only consider peaks larger
    if (message.payload[0] > 6 || message.payload[0] > triggerMax) {
      triggerMax = message.payload[0]
      lastTrigger = message.metadata.timestamp

      // Generate the trigger event
      const event = new Event(message.metadata.timestamp + 5000, 1)
      emit(event)
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
                <TimeAxis />
                <VerticalAxis label="Acceleration m/s²" />
                <TriggerDomain
                  window={10000}
                  dataSource={triggerDS}
                  accessor={(event, time) => time}
                />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
