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

const MIN_LIMIT = 5;
const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 5;

function clampLimit(value: number): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, n));
}

export default function AdSettings() {
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_LIMIT);
  const [bannerEnabled, setBannerEnabled] = useState(true);
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
            clampLimit(s.adsDailyInterstitialLimit ?? DEFAULT_LIMIT)
          );
          setBannerEnabled(
            s.adsBannerEnabled === undefined ? true : Boolean(s.adsBannerEnabled)
          );
        }
      } catch (err) {
        console.error("Failed to fetch ad settings", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const limit = clampLimit(dailyLimit);
    if (limit !== dailyLimit) {
      setDailyLimit(limit);
    }

    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/updatesettings`,
        {
          adsDailyInterstitialLimit: limit,
          adsBannerEnabled: bannerEnabled,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Ad settings updated!");
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err: unknown) {
      console.error("Update ad settings error:", err);
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
        title="Mobile App Ads"
        desc="Reels app — daily interstitials and home banner"
      >
        <p className="text-sm text-gray-500">Loading settings...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard
      title="Mobile App Ads"
      desc="Reels app — daily interstitials and home banner"
    >
      <div className="space-y-6">
        <div>
          <Label>Daily interstitial limit (per user)</Label>
          <Input
            type="number"
            placeholder="5"
            min={String(MIN_LIMIT)}
            max={String(MAX_LIMIT)}
            defaultValue={String(dailyLimit)}
            onChange={(e) => setDailyLimit(clampLimit(e.target.value))}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum {MIN_LIMIT}, maximum {MAX_LIMIT}. Fullscreen ads on reels and
            tabs; resets at midnight IST. Banner is separate and not counted.
          </p>
        </div>

        <div>
          <Switch
            label="Show banner on Home (reels)"
            defaultChecked={bannerEnabled}
            onChange={(checked) => setBannerEnabled(checked)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {bannerEnabled
              ? "The 320×50 banner appears at the bottom of the Home tab."
              : "Banner hidden. Users can still see fullscreen interstitials until the daily limit."}
          </p>
        </div>

        <div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Ad Settings"}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ComponentCard>
  );
}
