import {
  ChartContainer,
  LineChart,
  PointAnnotation,
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
          Title Legend
          Chart Chart
        `

const baroDS = new MessageDataSource('baro')

export const StatusBlock = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>Blah status and stuff</Areas.Title>
            <Areas.Chart>
              <ChartContainer>
                {/* height="12vh" */}
                <LineChart
                  dataSource={baroDS}
                  accessor={event => event / 100}
                  color={Colors.GRAY4}
                />
                <VerticalAxis />
                <RealTimeDomain window={10000} yMin={990} yMax={1020} />
                <PointAnnotation
                  dataSource={baroDS}
                  xAccessor={(event, time) => time + 200}
                  y={1000}
                >
                  <div>
                    BAROMETRIC PRESSURE
                    <br />
                    $VALUE
                  </div>
                </PointAnnotation>
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
