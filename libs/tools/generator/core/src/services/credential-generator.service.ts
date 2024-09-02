import {
  combineLatest,
  distinctUntilChanged,
  endWith,
  filter,
  firstValueFrom,
  ignoreElements,
  map,
  mergeMap,
  Observable,
  switchMap,
  takeUntil,
} from "rxjs";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { StateProvider } from "@bitwarden/common/platform/state";
import { SingleUserDependency, UserDependency } from "@bitwarden/common/tools/dependencies";
import { UserStateSubject } from "@bitwarden/common/tools/state/user-state-subject";
import { Constraints } from "@bitwarden/common/tools/types";

import { PolicyEvaluator } from "../abstractions";
import { mapPolicyToEvaluatorV2 } from "../rx";
import { CredentialGeneratorConfiguration as Configuration } from "../types/credential-generator-configuration";

type Policy$Dependencies = UserDependency;
type Settings$Dependencies = Partial<UserDependency>;
// FIXME: once the modernization is complete, switch the type parameters
// in `PolicyEvaluator<P, S>` and bake-in the constraints type.
type Evaluator<Settings, Policy> = PolicyEvaluator<Policy, Settings> & Constraints<Settings>;

export class CredentialGeneratorService {
  constructor(
    private stateProvider: StateProvider,
    private policyService: PolicyService,
  ) {}

  /** Get the settings for the provided configuration
   * @param configuration determines which generator's settings are loaded
   * @param dependencies.userId$ identifies the user to which the settings are bound.
   *   If this parameter is not provided, the observable follows the active user and
   *   may not complete.
   * @returns an observable that emits settings
   * @remarks the observable enforces policies on the settings
   */
  settings$<Settings, Policy>(
    configuration: Configuration<Settings, Policy>,
    dependencies?: Settings$Dependencies,
  ) {
    const userId$ = dependencies?.userId$ ?? this.stateProvider.activeUserId$;
    const completion$ = userId$.pipe(ignoreElements(), endWith(true));

    const state$ = userId$.pipe(
      filter((userId) => !!userId),
      distinctUntilChanged(),
      switchMap((userId) => {
        const state$ = this.stateProvider
          .getUserState$(configuration.settings.account, userId)
          .pipe(takeUntil(completion$));

        return state$;
      }),
      map((settings) => settings ?? structuredClone(configuration.settings.initial)),
    );

    const settings$ = combineLatest([state$, this.policy$(configuration, { userId$ })]).pipe(
      map(([settings, policy]) => {
        // FIXME: create `onLoadApply` that wraps these operations
        const applied = policy.applyPolicy(settings);
        const sanitized = policy.sanitize(applied);
        return sanitized;
      }),
    );

    return settings$;
  }

  /** Get a subject bound to a specific user's settings
   * @param configuration determines which generator's settings are loaded
   * @param dependencies.singleUserId$ identifies the user to which the settings are bound
   * @returns a promise that resolves with the subject once
   *  `dependencies.singleUserId$` becomes available.
   * @remarks the subject enforces policy for the settings
   */
  async settings<Settings, Policy>(
    configuration: Configuration<Settings, Policy>,
    dependencies: SingleUserDependency,
  ) {
    const userId = await firstValueFrom(
      dependencies.singleUserId$.pipe(filter((userId) => !!userId)),
    );
    const state = this.stateProvider.getUser(userId, configuration.settings.account);

    // FIXME: apply policy to the settings - this should happen *within* the subject.
    // Note that policies could be evaluated when the settings are saved or when they
    // are loaded. The existing subject presently could only apply settings on save
    // (by wiring the policy in as a dependency and applying with "nextState"), and
    // even that has a limitation since arbitrary dependencies do not trigger state
    // emissions.
    const subject = new UserStateSubject(state, dependencies);

    return subject;
  }

  /** Get the policy for the provided configuration
   *  @param dependencies.userId$ determines which user's policy is loaded
   *  @returns an observable that emits the policy once `dependencies.userId$`
   *   and the policy become available.
   */
  policy$<Settings, Policy>(
    configuration: Configuration<Settings, Policy>,
    dependencies: Policy$Dependencies,
  ): Observable<Evaluator<Settings, Policy>> {
    const completion$ = dependencies.userId$.pipe(ignoreElements(), endWith(true));

    const policy$ = dependencies.userId$.pipe(
      mergeMap((userId) => {
        // complete policy emissions otherwise `mergeMap` holds `policy$` open indefinitely
        const policies$ = this.policyService
          .getAll$(configuration.policy.type, userId)
          .pipe(takeUntil(completion$));
        return policies$;
      }),
      mapPolicyToEvaluatorV2(configuration.policy),
    );

    return policy$;
  }
}
