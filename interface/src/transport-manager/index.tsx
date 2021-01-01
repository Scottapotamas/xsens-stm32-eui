import 'source-map-support/register'

import { deviceManager } from './config'
import { setupProxyAndDebugInterface } from '@electricui/components-desktop-blueprint'
import { setupTransportWindow } from '@electricui/utility-electron'

const root = document.createElement('div')
document.body.appendChild(root)

setupProxyAndDebugInterface(root, deviceManager, module.hot)
setupTransportWindow()
