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
        Title Legend
        Chart Chart
      `

const freeAccelerationDS = new MessageDataSource('fracc')

export const FreeAccelerationChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>FREE ACCELERATION</b>
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
                  <b>X:</b>
                  <div
                    style={{
                      width: '2.75em',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  >
                    <Printer accessor={state => state.fracc[0]} precision={2} />
                  </div>
                </Tag>
                <Tag intent={Intent.PRIMARY} fill>
                  <b>Y:</b>
                  <div
                    style={{
                      width: '2.75em',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  >
                    <Printer accessor={state => state.fracc[1]} precision={2} />
                  </div>
                </Tag>
                <Tag intent={Intent.DANGER} fill>
                  <b>Z:</b>
                  <div
                    style={{
                      width: '2.75em',
                      textAlign: 'right',
                      display: 'inline-block',
                    }}
                  >
                    <Printer accessor={state => state.fracc[2]} precision={2} />
                  </div>
                </Tag>
              </Composition>
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer>
                {/* height="12vh" */}
                <LineChart
                  dataSource={freeAccelerationDS}
                  accessor={event => event[0]}
                  color={Colors.GREEN4}
                />
                <LineChart
                  dataSource={freeAccelerationDS}
                  accessor={event => event[1]}
                  color={Colors.BLUE4}
                />
                <LineChart
                  dataSource={freeAccelerationDS}
                  accessor={event => event[2]}
                  color={Colors.RED4}
                />
                <RealTimeDomain window={10000} />
                <TimeAxis />
                <VerticalAxis
                  label="Local Acceleration (m/s²)"
                  labelPadding={20}
                />
              </ChartContainer>
            </Areas.Chart>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
