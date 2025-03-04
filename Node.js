const {RecaptchaEnterpriseServiceClient} = require('@google-cloud/recaptcha-enterprise');

/**
  * 创建评估以分析界面操作的风险。
  *
  * projectID: 您的 Google Cloud 项目 ID。
  * recaptchaSiteKey: 与网站/应用关联的 reCAPTCHA 密钥
  * token: 从客户端获取的已生成令牌。
  * recaptchaAction: 与令牌对应的操作名称。
  */
async function createAssessment({
  // 待办事项：在运行示例之前，替换令牌和 reCAPTCHA 操作变量。
  projectID = "my-test-thing-1741081123656",
  recaptchaKey = "6LeEHukqAAAAAHniKmB_c2PTe5XrEgH-HFZtyLoE",
  token = "action-token",
  recaptchaAction = "action-name",
}) {
  // 创建 reCAPTCHA 客户端。
  // 待办：在退出方法前，对客户端生成代码进行缓存（推荐）或调用 client.close()。
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  // 构建评估请求。
  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });

  const [ response ] = await client.createAssessment(request);

  // 检查令牌是否有效。
  if (!response.tokenProperties.valid) {
    console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
    return null;
  }

  // 检查是否执行了预期操作。
  // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
  if (response.tokenProperties.action === recaptchaAction) {
    // 获取风险得分和原因。
    // 如需详细了解如何解读评估，请参阅：
    // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
    response.riskAnalysis.reasons.forEach((reason) => {
      console.log(reason);
    });

    return response.riskAnalysis.score;
  } else {
    console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
    return null;
  }
}
