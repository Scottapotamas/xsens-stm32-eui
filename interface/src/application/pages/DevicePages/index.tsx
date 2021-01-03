import { RouteComponentProps, Router } from '@reach/router'

import { DisconnectionModal } from '@electricui/components-desktop-blueprint'
import { Header } from '../../components/Header'
import { Intent } from '@blueprintjs/core'
import React from 'react'
import { navigate } from '@electricui/utility-electron'

import { StatusBlock } from './StatusBlock'
import { ControlBlock } from './ControlBlock'

import { PoseChart } from './PoseChart'
import { AccelerationChart } from './AccelerationChart'
import { FreeAccelerationChart } from './FreeAccelerationChart'
import { RateOfTurnChart } from './RateOfTurnChart'
import { MagnetometerChart } from './MagnetometerChart'
import { IMUPose3D } from './IMUPose3D'

import { Card } from '@blueprintjs/core'
import { Composition } from 'atomic-layout'

interface InjectDeviceIDFromLocation {
  deviceID?: string
}

const layoutDescription = `
        Control GForce Model
        Control Review Pose
        Control FreeAccel Rotation
      `

export const DevicePages = (
  props: RouteComponentProps & InjectDeviceIDFromLocation,
) => {
  if (!props.deviceID) {
    return <div>No deviceID?</div>
  }

  return (
    <React.Fragment>
      <DisconnectionModal
        intent={Intent.WARNING}
        icon="issue"
        navigateToConnectionsScreen={() => navigate('/')}
      >
        <p>Connection has been lost with the host microcontroller!</p>
      </DisconnectionModal>

      <div className="device-pages">
        <div className="device-content">
          <Composition
            areas={layoutDescription}
            gap={10}
            autoCols="auto 1fr 1fr"
          >
            {Areas => (
              <React.Fragment>
                <Areas.Control>
                  <Header deviceID={props.deviceID} {...props} />
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
                <Areas.Review>
                  Blanking linechart for notable acceleration events
                </Areas.Review>
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
        </div>
      </div>
    </React.Fragment>
  )
}
