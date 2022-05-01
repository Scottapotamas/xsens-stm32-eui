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

import IMUModel from '../../components/xsens-mti300/xsens-mti300.glb'
import { MSGID } from 'src/application/typedState'

GLTF.preload(IMUModel)

export const IMUPose3D = () => {
  return (
    <React.Fragment>
      <Environment
        camera={{
          fov: 50,
          position: [0, 0, -85],
        }}
        // style={{ width: '100%', height: '25vh' }}
      >
        {/* <OrbitControls /> */}
        <ControlledGroup
          position={[0, 0, 0]}
          quaternionAccessor={state => {
            return [state[MSGID.IMU_POSE_QUAT].q2, state[MSGID.IMU_POSE_QUAT].q3, state[MSGID.IMU_POSE_QUAT].q1, state[MSGID.IMU_POSE_QUAT].q0]
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
