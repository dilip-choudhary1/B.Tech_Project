const secureUri = "https://localhost:8003/mfs100/"; //Secure
const insecureUri = "http://localhost:8004/mfs100/"; // Non-Secure

export const GetMFS100Info = async () => {
  //capture button
  return await GetMFS100Client("info");
};

const GetMFS100KeyInfo = async (key) => {
  const MFS100Request = {
    Key: key,
  };
  const jsondata = JSON.stringify(MFS100Request);
  return await PostMFS100Client("keyinfo", jsondata);
};

export const CaptureFinger = async (quality, timeout) => {
  // 2nd
  const MFS100Request = {
    Quality: quality,
    TimeOut: timeout,
  };
  const jsondata = JSON.stringify(MFS100Request);

  return await PostMFS100Client("capture", jsondata);
};

// Devyang Multi Finger Capture
const CaptureMultiFinger = async (quality, timeout, nooffinger) => {
  const MFS100Request = {
    Quality: quality,
    TimeOut: timeout,
    NoOfFinger: nooffinger,
  };
  const jsondata = JSON.stringify(MFS100Request);
  return await PostMFS100Client("capturewithdeduplicate", jsondata);
};

export const VerifyFinger = async (ProbFMR, GalleryFMR) => {
  const MFS100Request = {
    ProbTemplate: ProbFMR,
    GalleryTemplate: GalleryFMR,
    BioType: "FMR", // or "ANSI" if using ANSI Template
  };
  const jsondata = JSON.stringify(MFS100Request);
  // console.log("json data: ",jsondata);
  return await PostMFS100Client("verify", jsondata);
};

const MatchFinger = async (quality, timeout, GalleryFMR) => {
  const MFS100Request = {
    Quality: quality,
    TimeOut: timeout,
    GalleryTemplate: GalleryFMR,
    BioType: "FMR", // or "ANSI" if using ANSI Template
  };
  const jsondata = JSON.stringify(MFS100Request);
  return await PostMFS100Client("match", jsondata);
};

const GetPidData = async (BiometricArray) => {
  const req = new MFS100Request(BiometricArray);
  const jsondata = JSON.stringify(req);
  return await PostMFS100Client("getpiddata", jsondata);
};

const GetRbdData = async (BiometricArray) => {
  const req = new MFS100Request(BiometricArray);
  const jsondata = JSON.stringify(req);
  return await PostMFS100Client("getrbddata", jsondata);
};

const PostMFS100Client = async (method, jsonData) => {
  try {
    const response = await fetch(insecureUri + method, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { httpStatus: true, data };
  } catch (error) {
    return { httpStatus: false, err: getHttpError(error) };
  }
};

const GetMFS100Client = async (method) => {
  try {
    const response = await fetch(insecureUri + method, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { httpStatus: true, data };
  } catch (error) {
    return { httpStatus: false, err: getHttpError(error) };
  }
};

const getHttpError = (error) => {
  let err = "Unhandled Exception";

  if (error.message.includes("404")) {
    err = "Requested page not found";
  } else if (error.message.includes("500")) {
    err = "Internal Server Error";
  } else if (error.message.includes("parsererror")) {
    err = "Requested JSON parse failed";
  } else if (error.message.includes("timeout")) {
    err = "Time out error";
  } else if (error.message.includes("abort")) {
    err = "Ajax request aborted";
  } else if (error.message.includes("Service Unavailable")) {
    err = "Service Unavailable";
  }

  return err;
};

/////////// Classes

class Biometric {
  constructor(BioType, BiometricData, Pos, Nfiq, Na) {
    this.BioType = BioType;
    this.BiometricData = BiometricData;
    this.Pos = Pos;
    this.Nfiq = Nfiq;
    this.Na = Na;
  }
}

class MFS100Request {
  constructor(BiometricArray) {
    this.Biometrics = BiometricArray;
  }
}
