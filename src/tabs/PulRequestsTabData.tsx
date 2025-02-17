import {
  GitRepository,
  GitPullRequestSearchCriteria,
  PullRequestStatus,
  IdentityRefWithVote,
} from "azure-devops-extension-api/Git/Git";
import { IStatusProps } from "azure-devops-ui/Status";
import { IColor } from "azure-devops-ui/Utilities/Color";
import { SortOrder } from "azure-devops-ui/Table";
import { IdentityRef } from "azure-devops-extension-api/WebApi/WebApi";
import {
  TeamProjectReference,
  WebApiTagDefinition
} from "azure-devops-extension-api/Core/Core";
import { PullRequestModel } from "../models/PullRequestModel";
import { compare } from "../lib/date";

export const refsPreffix = "refs/heads/";

export enum ReviewerVoteOption {
  Approved = 10,
  ApprovedWithSuggestions = 5,
  Rejected = -10,
  WaitingForAuthor = -5,
  NoVote = 0,
}

export enum AlternateStatusPr {
  AutoComplete = "Auto Complete",
  Conflicts = "Conflicts",
  HasNewChanges = "Has New Changes",
  IsDraft = "Is Draft",
  NotAutoComplete = "Not Auto Complete",
  NotConflicts = "Not Conflicts",
  NotIsDraft = "Not Draft",
  NotReadyForCompletion = "Not Ready for Completion",
  ReadForCompletion = "Ready for Completion",
}

export class BranchDropDownItem {
  private DISPLAY_NAME: string = "";

  constructor(public repositoryName: string, public branchName: string) {
    this.branchName = this.branchName.replace(refsPreffix, "");
    this.DISPLAY_NAME = `${this.repositoryName}->${this.branchName}`;
  }

  public get displayName(): string {
    return this.DISPLAY_NAME;
  }
}

export class PullRequestPolicy {
  public id: string = "";
  public displayName: string = "";
  public isApproved: boolean = false;
}

export class PullRequestRequiredReviewer {
  public id: string = "";
  public displayName: string = "";
}

export class PullRequestComment {
  public terminatedComment: number = 0;
  public totalcomment: number = 0;
  public lastUpdatedDate?: Date;
}

export interface IStatusIndicatorData {
  statusProps: IStatusProps;
  label: string;
}

export const draftColor: IColor = {
  red: 14,
  green: 180,
  blue: 250,
};

export const pullRequestCriteria: GitPullRequestSearchCriteria = {
  repositoryId: "",
  creatorId: "",
  includeLinks: true,
  reviewerId: "",
  sourceRefName: "",
  sourceRepositoryId: "",
  status: PullRequestStatus.Active,
  targetRefName: "",
};

/**
 * Custom type for the team to reduce the size of filter value in local storage
 */
export interface TeamRef {
  id: string,
  name: string,
  members: string[]
}

export interface IPullRequestsTabState {
  projects: TeamProjectReference[];
  pullRequests: PullRequestModel[];
  repositories: GitRepository[];
  createdByList: IdentityRef[];
  teamsList: Record<string, TeamRef>;
  sourceBranchList: BranchDropDownItem[];
  targetBranchList: BranchDropDownItem[];
  reviewerList: IdentityRefWithVote[];
  tagList: WebApiTagDefinition[];
  loading: boolean;
  errorMessage: string;
  pullRequestCount: number;
  savedProjects: string[];
  /** Direction to sort pull request age in */
  sortOrder: SortOrder;
}

export function sortBranchOrIdentity(
  a: BranchDropDownItem | IdentityRef,
  b: BranchDropDownItem | IdentityRef
): number {
  if (a.displayName! < b.displayName!) {
    return -1;
  }
  if (a.displayName! > b.displayName!) {
    return 1;
  }

  return 0;
}

export function sortTagRepoTeamProject(
  a: WebApiTagDefinition | GitRepository | TeamProjectReference,
  b: WebApiTagDefinition | GitRepository | TeamProjectReference
): number {
  if (a.name! < b.name!) {
    return -1;
  }
  if (a.name! > b.name!) {
    return 1;
  }

  return 0;
}

export function sortPullRequests(
  a: PullRequestModel,
  b: PullRequestModel,
  order: SortOrder
) {
  return order === SortOrder.ascending
    ? comparePullRequestAge(a, b)
    : -comparePullRequestAge(a, b); // Invert if descending
}

/**
 * Compares the age of two pull requests.
 * @returns A negative number if {@link a} is more recent than {@link b},
 * a positive number if {@link a} is older than {@link b}, otherwise 0.
 */
export function comparePullRequestAge(
  a: PullRequestModel,
  b: PullRequestModel
) {
  return compare(
    b.gitPullRequest.creationDate,
    a.gitPullRequest.creationDate
  );
}
