import { RouteComponentProps, Router } from '@reach/router'

import { DisconnectionModal } from '@electricui/components-desktop-blueprint'
import { Header } from '../../components/Header'
import { Intent } from '@blueprintjs/core'
import { OverviewPage } from './OverviewPage'
import React from 'react'
import { navigate } from '@electricui/utility-electron'

interface InjectDeviceIDFromLocation {
  deviceID?: string
}

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
        <Header deviceID={props.deviceID} {...props} />
        <div className="device-content">
          <Router primary={false}>
            <OverviewPage path="/" />
          </Router>
        </div>
      </div>
    </React.Fragment>
  )
}
