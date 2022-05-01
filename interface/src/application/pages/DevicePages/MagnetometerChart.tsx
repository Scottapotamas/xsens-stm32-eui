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
import { MSGID } from 'src/application/typedState'

const layoutDescription = `
        Title Legend
        Chart Chart
      `

const magDS = new MessageDataSource(MSGID.IMU_MAG)

export const MagnetometerChart = () => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Title>
              <div style={{ textAlign: 'left', marginLeft: '4em' }}>
                <b>MAGNETOMETER</b>
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
                  <b>X:</b>{' '}
                  <Printer accessor={state => state[MSGID.IMU_MAG][0]} precision={2} />
                </Tag>
                <Tag intent={Intent.PRIMARY} minimal fill>
                  <b>Y:</b>{' '}
                  <Printer accessor={state => state[MSGID.IMU_MAG][1]} precision={2} />
                </Tag>
                <Tag intent={Intent.DANGER} minimal fill>
                  <b>Z:</b>{' '}
                  <Printer accessor={state => state[MSGID.IMU_MAG][2]} precision={2} />
                </Tag>
              </Composition>
            </Areas.Legend>

            <Areas.Chart>
              <ChartContainer>
                {/* height="12vh" */}
                <LineChart
                  dataSource={magDS}
                  accessor={event => event[0]}
                  color={Colors.GREEN4}
                />
                <LineChart
                  dataSource={magDS}
                  accessor={event => event[1]}
                  color={Colors.BLUE4}
                />
                <LineChart
                  dataSource={magDS}
                  accessor={event => event[2]}
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
