import React, { Component } from 'react';

export class WebTwainScanningReactTutorial extends Component {
    static displayName = WebTwainScanningReactTutorial.name;

    render() {
        return (
            <div style={{textAlign: "center"}}>
              <h1>Web TWAIN Scanning Tutorial for React.js</h1>
              <h3>Preview of scanned image</h3>
              <input type="image" id="previewImage" alt="Preview of scanned image" style={{border: "1px solid black", width: "350px", height: "350px"}} />
              <br />
              <br />
              <a href="https://www.vintasoft.com/docs/vstwain-dotnet-web/Licensing-Twain_Web-Evaluation.html" target="_blank">Read how to get the evaluation license</a><br />
              <a href="https://www.vintasoft.com/zip/VintasoftWebTwainService-15.2.1.zip">Download installer of VintaSoft Web TWAIN service</a><br />
            </div>
        );
    }

    componentDidMount() {
        // acquire images from TWAIN device
        this.acquireImagesFromTwainDevice();
    }

    acquireImagesFromTwainDevice() {
      this.registerVintasoftWebTwainService();

      var twainDeviceManager = this.openTwainDeviceManager();
      if (twainDeviceManager == null) {
        alert('TWAIN device manager is not found.');
        return;
      }

      var twainDevice = null;
      try {
        twainDevice = twainDeviceManager.get_DefaultDevice();
        if (twainDevice == null) {
          alert('TWAIN device is not found.');
          return;
        }

        // open TWAIN device (do not display device UI but display dialog with image scanning progress)
        twainDevice.open(false, true);

        var acquireModalState;
        do {
          // do one step of modal image acquisition process
          var acquireModalResult = twainDevice.acquireModalSync();
          // get state of image acquisition
          acquireModalState = acquireModalResult.get_AcquireModalState().valueOf();

          switch (acquireModalState) {
            case 2:   // image is acquired
              // get acquired image
              var acquiredImage = acquireModalResult.get_AcquiredImage();
              // get image as Base64 string
              var bitmapAsBase64String = acquiredImage.getAsBase64String();
              // update image preview
              var previewImageElement = document.getElementById('previewImage');
              previewImageElement.src = bitmapAsBase64String;
              break;
            case 4:   // scan is failed
              alert(acquireModalResult.get_ErrorMessage());
              break;
            case 9:   // scan is finished
              break;
          }
        }
        while (acquireModalState !== 0);
      }
      catch (ex) {
        alert(ex);
      }
      finally {
        if (twainDevice != null) {
          // close the device
          twainDevice.close();
        }
        // close the device manager
        twainDeviceManager.close();
      }
    }

    registerVintasoftWebTwainService() {
      // declare reference to the Vintasoft namespace
      var Vintasoft = window.Vintasoft;

      // register the evaluation version of VintaSoft Web TWAIN service
      // please read how to get evaluation license in documentation: https://www.vintasoft.com/docs/vstwain-dotnet-web/Licensing-Twain_Web-Evaluation.html
      Vintasoft.Twain.WebTwainGlobalSettingsJS.register('REG_USER', 'REG_URL', 'REG_CODE', 'EXPIRATION_DATE');
    }

    openTwainDeviceManager() {
      // declare reference to the Vintasoft namespace
      var Vintasoft = window.Vintasoft;

      // URL to the VintaSoft Web TWAIN service
      var serviceUrl = 'https://localhost:25329/api/VintasoftTwainApi';
      // a Web API controller that allows to work with TWAIN devices
      var twainService = new Vintasoft.Shared.WebServiceControllerJS(serviceUrl);

      // TWAIN device manager
      var twainDeviceManager = new Vintasoft.Twain.WebTwainDeviceManagerJS(twainService);

      // the default settings of TWAIN device manager
      var deviceManagerInitSetting = new Vintasoft.Twain.WebTwainDeviceManagerInitSettingsJS();

      try {
        // open TWAIN device manager
        twainDeviceManager.open(deviceManagerInitSetting);
      }
      catch (ex) {
        alert(ex);
        return null;
      }
      return twainDeviceManager;
    }

}
