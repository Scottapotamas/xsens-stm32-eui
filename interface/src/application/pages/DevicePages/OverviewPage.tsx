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
import { PressureChart } from './PressureChart'
import { TemperatureChart } from './TemperatureChart'

import {
  Environment,
  ControlledGroup,
  GLTF,
  OrbitControls,
} from '@electricui/components-desktop-three'

import IMUModel from '../../components/xsens-mti300/xsens-mti300.glb'
import { IntervalRequester } from '@electricui/components-core'

// GLTF.preload(IMUModel)

const layoutDescription = `
        Control GForce Model
        Status Rotation FreeAccel
        Pose Pose Pose
      `

export const OverviewPage = (props: RouteComponentProps) => {
  return (
    <React.Fragment>
      <IntervalRequester variable="sys" interval={250} />
      <Composition areas={layoutDescription} gap={10} autoCols="1fr">
        {Areas => (
          <React.Fragment>
            <Areas.Control>
              <Card>
                <ControlBlock />
              </Card>
            </Areas.Control>
            <Areas.Status>
              <Card>
                <StatusBlock />
              </Card>
            </Areas.Status>

            <Areas.Model>
              3D Model of IMU goes here
              {/* <Environment>
            <OrbitControls />
            <ControlledGroup
              position={[30, 1.75, 0]}
              rotationAccessor={state => {
                return [state.pose[0], state.pose[1], state.pose[2]]
              }}
            >
              <GLTF asset={IMUModel} />
            </ControlledGroup>
            <ambientLight intensity={0.95} />
          </Environment> */}
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
