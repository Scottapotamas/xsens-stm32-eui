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
      <Environment
        camera={{
          fov: 50,
          position: [0, 0, -85],
        }}
        style={{ width: '100%', height: '25vh' }}
      >
        {/* <OrbitControls /> */}
        <ControlledGroup
          position={[0, 0, 0]}
          // positionAccessor={state => {
          //   return [state.acc[1] / 10, state.acc[2] / 10, state.acc[0] / 10]
          // }}
          quaternionAccessor={state => {
            return [state.quat.q2, state.quat.q3, state.quat.q1, state.quat.q0]
          }}
        >
          <GLTF asset={IMUModel} />
        </ControlledGroup>
        <ambientLight intensity={0.1} />
        <hemisphereLight intensity={0.3} />
        <directionalLight intensity={1.0} />
      </Environment>
    </React.Fragment>
  )
}
