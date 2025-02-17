import * as DevOps from "azure-devops-extension-sdk";
import { AzureGitModels } from "../models/GitModels";
import { TeamProjectReference } from "azure-devops-extension-api/Core/Core";
import { IProjectInfo } from "azure-devops-extension-api";

const evaluationApiUrl =
  "[baseUrl]/_apis/policy/evaluations?artifactId=[artifactId]&api-version=5.1-preview.1";

export async function getEvaluationsPerPullRequest(
  baseUrl: string,
  project: IProjectInfo | TeamProjectReference | undefined,
  pullRequestId: number
): Promise<AzureGitModels.Value[]> {
  const artifactId = `vstfs:///CodeReview/CodeReviewId/${
    project!.id
  }/${pullRequestId}`;
  const accessToken = await DevOps.getAccessToken();

  const apiSettings = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const apiUrl = evaluationApiUrl
    .replace("[baseUrl]", baseUrl)
    .replace("[projectName]", project!.name)
    .replace("[artifactId]", encodeURIComponent(artifactId));

  return fetch(apiUrl, apiSettings)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return (data as AzureGitModels.GitPolicyRoot).value;
    });
}
