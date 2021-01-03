import { Card } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'
import React from 'react'
import { RouteComponentProps } from '@reach/router'

import { StatusBlock } from './StatusBlock'
import { ControlBlock } from './ControlBlock'

import { PoseChart } from './PoseChart'
import { AccelerationChart } from './AccelerationChart'
import { FreeAccelerationChart } from './FreeAccelerationChart'
import { RateOfTurnChart } from './RateOfTurnChart'
import { MagnetometerChart } from './MagnetometerChart'
import { TemperatureChart } from './TemperatureChart'
import { IMUPose3D } from './IMUPose3D'

import { IntervalRequester } from '@electricui/components-core'

const layoutDescription = `
        Control GForce Model
        Status FreeAccel Rotation
        Pose Pose Pose
      `

export const OverviewPage = (props: RouteComponentProps) => {
  return (
    <React.Fragment>
      <Composition areas={layoutDescription} gap={10} autoCols="auto 1fr 1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Control>
              <ControlBlock />
            </Areas.Control>
            <Areas.Status>
              <Card>
                <StatusBlock />
              </Card>
            </Areas.Status>

            <Areas.Model>
              <IMUPose3D />
            </Areas.Model>
            <Areas.GForce>
              <AccelerationChart />
            </Areas.GForce>
            <Areas.Rotation>
              <RateOfTurnChart />
            </Areas.Rotation>
            <Areas.FreeAccel>
              <FreeAccelerationChart />
            </Areas.FreeAccel>
            <Areas.Pose>
              <PoseChart />
            </Areas.Pose>
          </React.Fragment>
        )}
      </Composition>
    </React.Fragment>
  )
}
