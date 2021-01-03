import { Composition } from 'atomic-layout'
import {
  IntervalRequester,
  useHardwareState,
} from '@electricui/components-core'
import { MessageDataSource } from '@electricui/core-timeseries'
import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { Printer } from '@electricui/components-desktop'
import { IconNames } from '@blueprintjs/icons'

import {
  Environment,
  ControlledGroup,
  GLTF,
  OrbitControls,
} from '@electricui/components-desktop-three'
import { RoundedBox } from '@react-three/drei'

import IMUModel from '../../components/xsens-mti300/xsens-mti300.glb'

GLTF.preload(IMUModel)

export const IMUPose3D = () => {
  return (
    <React.Fragment>
      <React.Fragment>
        <div style={{ width: '100%', height: 300 }}>
          <Environment
            camera={{
              fov: 50,
              position: [0, 0, -100],
            }}
          >
            {/* <OrbitControls /> */}
            <ControlledGroup
              position={[0, -10, 0]}
              // positionAccessor={state => {
              //   return [state.acc[1] / 10, state.acc[2] / 10, state.acc[0] / 10]
              // }}
              quaternionAccessor={state => {
                return [
                  state.quat[2],
                  state.quat[3],
                  state.quat[1],
                  state.quat[0],
                ]
              }}
            >
              <GLTF asset={IMUModel} />
            </ControlledGroup>
            {/* <ambientLight intensity={0.1} /> */}
            <hemisphereLight intensity={0.7} />
          </Environment>
        </div>
      </React.Fragment>
    </React.Fragment>
  )
}
