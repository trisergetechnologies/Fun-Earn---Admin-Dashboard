"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "../../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Switch from "../switch/Switch";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/settings`;

const MIN_LIMIT = 1;
const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 1;

const MIN_GAP_SECONDS = 10;
const MAX_GAP_SECONDS = 10800;
const DEFAULT_GAP_SECONDS = 1800;

const MIN_BANNER_SECONDS = 10;
const MAX_BANNER_SECONDS = 7200;
const DEFAULT_BANNER_SECONDS = 600;

function clampLimit(value: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, n));
}

function clampSeconds(
  value: number,
  min: number,
  max: number,
  fallback: number
): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function splitMs(totalSeconds: number): { minutes: number; seconds: number } {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return { minutes: Math.floor(safe / 60), seconds: safe % 60 };
}

function combineMs(minutes: number, seconds: number): number {
  const m = Math.max(0, Math.floor(Number(minutes) || 0));
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  return m * 60 + s;
}

export default function DreamMartAdSettings() {
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_LIMIT);
  const [gapMinutes, setGapMinutes] = useState(30);
  const [gapSecondsPart, setGapSecondsPart] = useState(0);
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerMinutes, setBannerMinutes] = useState(10);
  const [bannerSecondsPart, setBannerSecondsPart] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/getsettings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const s = res.data.data;
          setDailyLimit(
            clampLimit(s.dreamMartAdsDailyInterstitialLimit ?? DEFAULT_LIMIT)
          );
          const gap = clampSeconds(
            s.dreamMartAdsMinGapSeconds ?? DEFAULT_GAP_SECONDS,
            MIN_GAP_SECONDS,
            MAX_GAP_SECONDS,
            DEFAULT_GAP_SECONDS
          );
          const gapParts = splitMs(gap);
          setGapMinutes(gapParts.minutes);
          setGapSecondsPart(gapParts.seconds);
          setBannerEnabled(
            s.dreamMartAdsBannerEnabled === undefined
              ? true
              : Boolean(s.dreamMartAdsBannerEnabled)
          );
          const banner = clampSeconds(
            s.dreamMartAdsBannerVisibleSecondsPerDay ?? DEFAULT_BANNER_SECONDS,
            MIN_BANNER_SECONDS,
            MAX_BANNER_SECONDS,
            DEFAULT_BANNER_SECONDS
          );
          const bannerParts = splitMs(banner);
          setBannerMinutes(bannerParts.minutes);
          setBannerSecondsPart(bannerParts.seconds);
        }
      } catch (err) {
        console.error("Failed to fetch Dream Mart ad settings", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const limit = clampLimit(dailyLimit);
    if (limit !== dailyLimit) setDailyLimit(limit);

    const gapTotal = clampSeconds(
      combineMs(gapMinutes, gapSecondsPart),
      MIN_GAP_SECONDS,
      MAX_GAP_SECONDS,
      DEFAULT_GAP_SECONDS
    );
    const gapParts = splitMs(gapTotal);
    setGapMinutes(gapParts.minutes);
    setGapSecondsPart(gapParts.seconds);

    const bannerTotal = clampSeconds(
      combineMs(bannerMinutes, bannerSecondsPart),
      MIN_BANNER_SECONDS,
      MAX_BANNER_SECONDS,
      DEFAULT_BANNER_SECONDS
    );
    const bannerParts = splitMs(bannerTotal);
    setBannerMinutes(bannerParts.minutes);
    setBannerSecondsPart(bannerParts.seconds);

    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/updatesettings`,
        {
          dreamMartAdsDailyInterstitialLimit: limit,
          dreamMartAdsMinGapSeconds: gapTotal,
          dreamMartAdsBannerEnabled: bannerEnabled,
          dreamMartAdsBannerVisibleSecondsPerDay: bannerTotal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Dream Mart ad settings updated!");
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err: unknown) {
      console.error("Update Dream Mart ad settings error:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        toast.error(String(err.response.data.message));
      } else {
        toast.error("Failed to update settings");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ComponentCard
        title="Dream Mart Ads (AdMob)"
        desc="Dream Mart app — Google AdMob interstitials and banners"
      >
        <p className="text-sm text-gray-500">Loading settings...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      title="Dream Mart Ads (AdMob)"
      desc="Dream Mart app — daily interstitials, min gap, and banner visible time"
    >
      <div className="space-y-6">
        <div>
          <Label>Daily interstitial limit (per user)</Label>
          <Input
            type="number"
            placeholder="1"
            min={String(MIN_LIMIT)}
            max={String(MAX_LIMIT)}
            defaultValue={String(dailyLimit)}
            onChange={(e) => setDailyLimit(clampLimit(Number(e.target.value)))}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum {MIN_LIMIT}, maximum {MAX_LIMIT}. Resets at midnight IST.
            Separate from Reels Unity ads.
          </p>
        </div>

        <div>
          <Label>Minimum gap between interstitials</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Minutes</p>
              <Input
                type="number"
                placeholder="30"
                min="0"
                defaultValue={String(gapMinutes)}
                onChange={(e) =>
                  setGapMinutes(
                    Math.max(0, Math.floor(Number(e.target.value) || 0))
                  )
                }
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Seconds</p>
              <Input
                type="number"
                placeholder="0"
                min="0"
                max="59"
                defaultValue={String(gapSecondsPart)}
                onChange={(e) =>
                  setGapSecondsPart(
                    Math.min(
                      59,
                      Math.max(0, Math.floor(Number(e.target.value) || 0))
                    )
                  )
                }
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Total clamped to {MIN_GAP_SECONDS}–{MAX_GAP_SECONDS} seconds.
          </p>
        </div>

        <div>
          <Switch
            label="Show banners (Wallet / Checkout)"
            defaultChecked={bannerEnabled}
            onChange={(checked) => setBannerEnabled(checked)}
          />
        </div>

        <div>
          <Label>Banner visible time per day</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Minutes</p>
              <Input
                type="number"
                placeholder="10"
                min="0"
                defaultValue={String(bannerMinutes)}
                onChange={(e) =>
                  setBannerMinutes(
                    Math.max(0, Math.floor(Number(e.target.value) || 0))
                  )
                }
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Seconds</p>
              <Input
                type="number"
                placeholder="0"
                min="0"
                max="59"
                defaultValue={String(bannerSecondsPart)}
                onChange={(e) =>
                  setBannerSecondsPart(
                    Math.min(
                      59,
                      Math.max(0, Math.floor(Number(e.target.value) || 0))
                    )
                  )
                }
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visible-seconds budget while focused. Clamped to{" "}
            {MIN_BANNER_SECONDS}–{MAX_BANNER_SECONDS} seconds. Usage stays on
            device.
          </p>
        </div>

        <div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Dream Mart Ad Settings"}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ComponentCard>
  );
}
