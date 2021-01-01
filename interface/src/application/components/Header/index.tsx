import { Alignment, Button, Navbar } from '@blueprintjs/core'
import {
  useDeadline,
  useDeviceConnect,
  useDeviceConnectionRequested,
  useDeviceDisconnect,
} from '@electricui/components-core'

import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { navigate } from '@electricui/utility-electron'

interface InjectDeviceIDFromLocation {
  deviceID?: string
  '*'?: string // we get passed the path as the wildcard
}

export const Header = (
  props: RouteComponentProps & InjectDeviceIDFromLocation,
) => {
  const disconnect = useDeviceDisconnect()
  const connect = useDeviceConnect()
  const connectionRequested = useDeviceConnectionRequested()
  const getDeadline = useDeadline()

  const page = props['*'] // we get passed the path as the wildcard, so we read it here

  return (
    <div className="device-header">
      <Navbar style={{ background: 'transparent', boxShadow: 'none' }}>
        <div style={{ margin: '0 auto', width: '100%' }}>
          <Navbar.Group align={Alignment.LEFT}>
            <Button
              minimal
              large
              icon="home"
              text="Back"
              onClick={() => {
                navigate('/')
              }}
            />

            {connectionRequested ? (
              <Button
                minimal
                intent="danger"
                icon="cross"
                text="Disconnect"
                onClick={() => {
                  const cancellationToken = getDeadline()
                  
                  disconnect(cancellationToken).catch(err => {
                    if (cancellationToken.caused(err)) {
                      return
                    }

                    console.warn("Failed to connect", err)
                  })
                }}
              />
            ) : (
              <Button
                minimal
                icon="link"
                intent="success"
                text="Connect again"
                onClick={() => {
                  const cancellationToken = getDeadline()

                  connect(cancellationToken).catch(err => {
                    if (cancellationToken.caused(err)) {
                      return
                    }
                    
                    console.warn("Failed to connect", err)
                  })
                }}
              />
            )}
          </Navbar.Group>{' '}
          <Navbar.Group align={Alignment.RIGHT}>
            <Button
              minimal
              large
              icon="dashboard"
              text="Overview"
              onClick={() => {
                navigate(`/devices/${props.deviceID}/`)
              }}
              active={page === ''}
            />
            <Button
              minimal
              large
              icon="settings"
              text="Secondary"
              onClick={() => {
                navigate(`/devices/${props.deviceID}/secondary`)
              }}
              active={page === 'secondary'}
            />
          </Navbar.Group>{' '}
        </div>
      </Navbar>
    </div>
  )
}
