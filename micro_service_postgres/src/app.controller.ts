import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  /**
   * Constructor for AppController
   * @param appService - Application service instance
   */
  constructor(private readonly appService: AppService) {}

  /**
   * GET endpoint that returns a hello world message
   * @returns Hello world string
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
