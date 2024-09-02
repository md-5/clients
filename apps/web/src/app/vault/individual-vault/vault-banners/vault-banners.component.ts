import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { BannerModule } from "@bitwarden/components";

import { VerifyEmailComponent } from "../../../auth/settings/verify-email.component";
import { SharedModule } from "../../../shared";

import { VaultBannersService, VisibleVaultBanner } from "./services/vault-banners.service";

@Component({
  standalone: true,
  selector: "app-vault-banners",
  templateUrl: "./vault-banners.component.html",
  imports: [VerifyEmailComponent, SharedModule, BannerModule],
  providers: [VaultBannersService],
})
export class VaultBannersComponent implements OnInit {
  visibleBanners: VisibleVaultBanner[] = [];
  premiumBannerVisible$: Observable<boolean>;
  VisibleVaultBanner = VisibleVaultBanner;

  constructor(private vaultBannerService: VaultBannersService) {
    this.premiumBannerVisible$ = this.vaultBannerService.shouldShowPremiumBanner$;
  }

  async ngOnInit(): Promise<void> {
    await this.determineVisibleBanners();
  }

  async dismissBanner(banner: VisibleVaultBanner): Promise<void> {
    await this.vaultBannerService.dismissBanner(banner);

    await this.determineVisibleBanners();
  }

  /** Determine which banners should be present */
  private async determineVisibleBanners(): Promise<void> {
    const showBrowserOutdated = await this.vaultBannerService.shouldShowUpdateBrowserBanner();
    const showVerifyEmail = await this.vaultBannerService.shouldShowVerifyEmailBanner();
    const showLowKdf = await this.vaultBannerService.shouldShowLowKDFBanner();

    this.visibleBanners = [
      showBrowserOutdated ? VisibleVaultBanner.OutdatedBrowser : null,
      showVerifyEmail ? VisibleVaultBanner.VerifyEmail : null,
      showLowKdf ? VisibleVaultBanner.KDFSettings : null,
    ].filter(Boolean); // remove all falsy values, i.e. null
  }
}
