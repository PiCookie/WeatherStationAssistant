import { injectionNames, Transitionable } from "assistant-source";
import { inject, injectable } from "inversify";
import { ApplicationState } from "./application";
import { MergedSetupSet } from "../../config/handler";
import * as moment from "moment";

/**
 * This is your MainState.
 * Every assistantJS application has to have a state called "MainState", which acts as the default state applied when the conversation starts.
 * Therefore all intent methods implemented here can be called directly from the starting point.
 */

const axios = require('axios');

// EDIT
const apiURL: string = "http://192.168.178.57:8000/api";
const defaultDeviceName: string = "Arduino";
const firstPerson: string = "Patricia";
const secondPerson: string = "Lukas";
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
    const greetings: string = transformHourToGreetingsOutput(moment().hour());
    this.prompt(this.t({greetings, firstPerson, secondPerson}));
  }

  /**
   * 
   * @param machine 
   */
  public async getCompleteWeatherInformationsIntent(machine: Transitionable) {
      // send get request to web server to get temperature, humidity, pressure and batteryLevel value
      let [temperature, humidity, pressure, batteryLevel] = await Promise.all([sendGetTemperatureRequest(), sendGetHumidityRequest(), sendGetPressureRequest(), sendGetBatteryLevelRequest()]);
      temperature = `${temperature}`.replace('.', ',');
      humidity = `${humidity}`.replace('.', ',');
      pressure = `${pressure}`.replace('.', ',');
      this.responseHandler.endSessionWith(await this.t({temperature, humidity, pressure, batteryLevel}));
  }

  /**
   * 
   * @param machine 
   */
  public async getTemperatureIntent(machine: Transitionable) {
    // send get request to web server to get temperature value
    let temperature = await Promise.resolve(sendGetTemperatureRequest());
    const intervall: string = transformTemperaturToIntervallOutput(temperature);
    temperature = `${temperature}`.replace('.', ',');
    this.responseHandler.endSessionWith(await this.t({intervall, temperature}));
  }

  /**
   * 
   * @param machine 
   */
  public async getHumidityIntent(machine: Transitionable) {
    // send get request to web server to get humidity value
    let humidity = await Promise.resolve(sendGetHumidityRequest());
    humidity = `${humidity}`.replace('.', ',');
    this.responseHandler.endSessionWith(await this.t({humidity}));
  }

  /**
   * 
   * @param machine 
   */
  public async getPressureIntent(machine: Transitionable) {
      // send get request to web server to get pressure value
      let pressure = await Promise.resolve(sendGetPressureRequest());
      pressure = `${pressure}`.replace('.', ',');
      this.responseHandler.endSessionWith(await this.t({pressure}));
  }

  /**
   * 
   * @param machine 
   */
  public async getBatteryStatusLevelIntent(machine: Transitionable) {
      // send get request to web server to get battery level
      const batteryLevel = await Promise.resolve(sendGetBatteryLevelRequest());
      const intervall: string = transformBatteryLevelToIntervallOutput(batteryLevel);
      this.responseHandler.endSessionWith(await this.t({intervall, batteryLevel}));
  }
}

/**
 * 
 * @param hour 
 */
function transformHourToGreetingsOutput(hour: number): string {
  if (hour <= 9) { 
    return "Guten Morgen";
  } 
  else if (hour <= 17) { 
    return "Guten Tag";
  } 
  else { 
    return "Guten Abend";
  }
}

/**
 * 
 * @param temperature 
 */
function transformTemperaturToIntervallOutput(temperature: number): string {
  if (temperature <= 6) { 
    return "Arschkalt.";
  } 
  else if (temperature <= 13) { 
    return "Brrr, ganz schön kalt.";
  } 
  else if (temperature <= 20) { 
    return "Es ist angenehm.";
  } 
  else if (temperature <= 27) { 
    return "Puh, ganz schön warm.";
  } 
  else { 
    return "Tierisch heiß.";
  }
}

/**
 * 
 * @param batteryLevel 
 */
function transformBatteryLevelToIntervallOutput(batteryLevel: number): string {
  if (batteryLevel <= 25) { 
    return "Oh oh, bald müssen deine Batterien gewechselt werden.";
  } 
  else if (batteryLevel <= 50) { 
    return "Die Leistung deiner Batterien neigen sich dem Ende zu.";
  } 
  else if (batteryLevel <= 75) { 
    return "Sieht noch alles gut aus.";
  } 
  else { 
    return "Du hast die doch gerade erst gewechselt.";
  }
}

/**
 * 
 */
async function sendGetTemperatureRequest() {
  const url = `${apiURL}/temperature?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.temperature;
  } catch(error) {
    console.log("sendGetTemperatureRequest Error: ", error);
  }
}

/**
 * 
 */
async function sendGetHumidityRequest() {
  const url = `${apiURL}/humidity?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.humidity;
  } catch(error) {
    console.log("sendGetHumidityRequest Error: ", error);
  }
}


/**
 * 
 */
async function sendGetPressureRequest() {
  const url = `${apiURL}/pressure?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.pressure;
  } catch(error) {
    console.log("sendGetPressureRequest Error: ", error);
  }
}

/**
 * 
 */
async function sendGetBatteryLevelRequest() {
  const url = `${apiURL}/batteryLevel?device=${defaultDeviceName}`;
  try {
    const response = await axios.get(url);
    return response.data.data.batteryLevel;
  } catch(error) {
    console.log("sendGetBatteryLevelRequest Error: ", error);
  }
}