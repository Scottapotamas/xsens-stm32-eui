import 'source-map-support/register'

import { deviceManager } from './config'
import { setupProxyAndDebugInterface } from '@electricui/components-desktop-blueprint'
import { setupTransportWindow } from '@electricui/utility-electron'
import {
  ElectronIPCRemoteQueryExecutor,
  QueryableMessageIDProvider,
} from '@electricui/core-timeseries'
import {
  DataSource,
  PersistenceEngineMemory,
} from '@electricui/core-timeseries'

import './styles.css'
import { MSGID } from 'src/application/typedState'

const root = document.createElement('div')
document.body.appendChild(root)

const hotReloadHandler = setupProxyAndDebugInterface(root, deviceManager)
setupTransportWindow()

const remoteQueryExecutor = new ElectronIPCRemoteQueryExecutor()
const messageIDQueryable = new QueryableMessageIDProvider(
  deviceManager,
  remoteQueryExecutor,
)

if (module.hot) {
  module.hot.accept('./config', () => hotReloadHandler(root, deviceManager))
}

messageIDQueryable.setPersistenceEngineFactory(
  MSGID.IMU_ACC,
  (dataSource: DataSource) => {
    return new PersistenceEngineMemory(40_000)
  },
)

messageIDQueryable.setPersistenceEngineFactory(
  MSGID.IMU_ROT,
  (dataSource: DataSource) => {
    return new PersistenceEngineMemory(40_000)
  },
)

messageIDQueryable.setPersistenceEngineFactory(
  MSGID.IMU_POSE_QUAT,
  (dataSource: DataSource) => {
    return new PersistenceEngineMemory(20_000)
  },
)