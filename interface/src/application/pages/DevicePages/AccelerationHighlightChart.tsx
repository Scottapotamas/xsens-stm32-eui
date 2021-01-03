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

// Datasource which emits true when a strong acceleration occured
// TODO: debounce timing
// TODO: peak detection to decide if event is interesting, instead of threshold
const triggerDS = new MessageDataSource('acc', (message, emit) => {
  if (message.payload[0] > 10) {
    const event = new Event(message.metadata.timestamp, 1)
    emit(event)
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
                <b>SIGNIFICANT ACCELERATION</b>
              </div>
            </Areas.Title>

            <Areas.Chart>
              <ChartContainer height="30vh">
                <BlankingLineChart
                  dataSource={accDS}
                  yAccessor={event => event[0]}
                  triggerDataSource={triggerDS}
                  width={1000}
                  color={Colors.RED4}
                />
                <TimeAxis />
                <VerticalAxis label="(units)" />
                {/* <RealTimeDomain window={10000} /> */}
                <RealTimeSlicingDomain
                  xMin={0}
                  xMax={1000}
                  yMin={-1}
                  yMax={1}
                  window={10000}
                />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
