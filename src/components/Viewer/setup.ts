import * as cornerstone from "@cornerstonejs/core";
import cornerstoneDICOMImageLoader from "@cornerstonejs/dicom-image-loader";
import * as cornerstoneTools from "@cornerstonejs/tools";
import { init as csToolsInit } from "@cornerstonejs/tools";
import dicomParser from "dicom-parser";

const {
  StackScrollMouseWheelTool,
  WindowLevelTool,
  ZoomTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools;

const { ViewportType, Events } = cornerstone.Enums;
const { MouseBindings, KeyboardBindings } = csToolsEnums;

let isInitialized = false;

export const initializeCornerstone = async () => {
  if (isInitialized) {
    return;
  }

  await cornerstone.init();
  await csToolsInit();

  cornerstoneTools.addTool(StackScrollMouseWheelTool);
  cornerstoneTools.addTool(WindowLevelTool);
  cornerstoneTools.addTool(ZoomTool);

  cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
  cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
  cornerstoneDICOMImageLoader.configure({
    useWebWorkers: true,
    decodeConfig: {
      convertFloatPixelDataToInt: false,
    },
  });

  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  };

  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
  cornerstone.imageLoader.registerImageLoader('wadouri', cornerstoneDICOMImageLoader.wadouri.loadImage);

  isInitialized = true;
};

export const setupToolGroup = (element: HTMLElement, viewportId: string, renderingEngineId: string) => {
  const toolGroupId = `toolGroup_${viewportId}`;
  let toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

  if (!toolGroup) {
    toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
    if (toolGroup) {  // Add this null check
      toolGroup.addTool(StackScrollMouseWheelTool.toolName);
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);

      toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Left Click
          },
        ],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: MouseBindings.Primary, // Ctrl + Left Click
            modifierKey: KeyboardBindings.Ctrl,
          },
        ],
      });
    }
  }

  if (toolGroup) {  // Add this null check
    toolGroup.addViewport(viewportId, renderingEngineId);
  }
};

export { Events, ViewportType };
