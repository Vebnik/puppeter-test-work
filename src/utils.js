
class Utils {
  async saveScreenshot(path) {
    console.log("Save Screenshot");
  }

  async getArgs() {
    return {
        product: process.argv.at(-2),
        region: process.argv.at(-1),
    }
  }
}

export default new Utils();