import { Card } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import React from 'react'
import { RouteComponentProps } from '@reach/router'

import { PoseChart } from './PoseChart'
import { AccelerationChart } from './AccelerationChart'
import { FreeAccelerationChart } from './FreeAccelerationChart'
import { RateOfTurnChart } from './RateOfTurnChart'
import { MagnetometerChart } from './MagnetometerChart'
import { PressureChart } from './PressureChart'
import { TemperatureChart } from './TemperatureChart'

export const OverviewPage = (props: RouteComponentProps) => {
  return (
    <React.Fragment>
      <Composition gap={10} templateCols="1fr">
        <Card>
          <PoseChart />
        </Card>
        <Composition gap={10} templateCols="1fr 1fr">
          <Card>
            <AccelerationChart />
          </Card>
          <Card>
            <FreeAccelerationChart />
          </Card>
          <Card>
            <RateOfTurnChart />
          </Card>
          <Card>
            <MagnetometerChart />
          </Card>
          <Card>
            <PressureChart />
          </Card>
          <Card>
            <TemperatureChart />
          </Card>
        </Composition>
      </Composition>
    </React.Fragment>
  )
}
