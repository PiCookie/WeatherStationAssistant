import { injectionNames, Transitionable } from "assistant-source";
import { inject, injectable } from "inversify";

import { ApplicationState } from "./application";
import { MergedSetupSet } from "../../config/handler";

/**
 * This is your MainState.
 * Every assistantJS application has to have a state called "MainState", which acts as the default state applied when the conversation starts.
 * Therefore all intent methods implemented here can be called directly from the starting point.
 */

const apiURL: string = "http://192.168.178.47:8000/api";
const defaultDeviceName: string = "Arduino";

@injectable()
export class MainState extends ApplicationState {
  constructor(@inject(injectionNames.current.stateSetupSet) stateSetupSet: MergedSetupSet) {
    super(stateSetupSet);
  }

  /**
   * The invokeGenericIntent method (GenericIntent.invoke) is your "main entrance" into your application. 
   * It is called as soon as the application is launched, e. g. if user says "launch xxxxx".
   */
  public async invokeGenericIntent(machine: Transitionable) {
    this.prompt(this.t());
  }

  /**
   * 
   * @param machine 
   */
  public async getCompleteWeatherInformationsIntent(machine: Transitionable) {
      // send get request to web server to get temperature, humidity, pressure and batteryLevel value
      const [temperature, humidity, pressure, batteryLevel] = await Promise.all([sendGetTemperatureRequest(), sendGetHumidityRequest(), sendGetPressureRequest(), sendGetBatteryLevelRequest()]);
      this.prompt(this.t({temperature, humidity, pressure, batteryLevel}));
  }

  /**
   * 
   * @param machine 
   */
  public async getTemperatureIntent(machine: Transitionable) {
    // send get request to web server to get temperature value
    const temperature = await Promise.resolve(sendGetTemperatureRequest());
    this.prompt(this.t({temperature}));
  }

  /**
   * 
   * @param machine 
   */
  public async getHumidityIntent(machine: Transitionable) {
    // send get request to web server to get humidity value
    const humidity = await Promise.resolve(sendGetHumidityRequest());
    this.prompt(this.t({humidity}));
  }

  /**
   * 
   * @param machine 
   */
  public async getPressureIntent(machine: Transitionable) {
      // send get request to web server to get pressure value
      const pressure = await Promise.resolve(sendGetPressureRequest());
      this.prompt(this.t({pressure}));
  }

  /**
   * 
   * @param machine 
   */
  public async getBatteryStatusLevelIntent(machine: Transitionable) {
      // send get request to web server to get battery level
      const batteryLevel = await Promise.resolve(sendGetBatteryLevelRequest());
      this.prompt(this.t({batteryLevel}));
  }
}

/**
 * 
 */
async function sendGetTemperatureRequest() {
  const axios = require('axios');
  const url = `${apiURL}/temperature?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.temperature;
  } catch(error) {
    console.log("error: ", error);
  }
}

/**
 * 
 */
async function sendGetHumidityRequest() {
  const axios = require('axios');
  const url = `${apiURL}/humidity?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.humidity;
  } catch(error) {
    console.log("error: ", error);
  }
}


/**
 * 
 */
async function sendGetPressureRequest() {
  const axios = require('axios');
  const url = `${apiURL}/pressure?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.pressure;
  } catch(error) {
    console.log("error: ", error);
  }
}

/**
 * 
 */
async function sendGetBatteryLevelRequest() {
  const axios = require('axios');
  const url = `${apiURL}/batteryLevel?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.batteryLevel;
  } catch(error) {
    console.log("error: ", error);
  }
}