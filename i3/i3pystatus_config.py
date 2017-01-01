from i3pystatus import Status

status = Status()

status.register("uptime")

# Displays clock like this:
status.register("clock",
        format="%Y/%m/%d %H:%M:%S",)

# Shows the average load of the last minute and the last 5 minutes
status.register("load")

# This would look like this, when discharging (or charging)
# ↓14.22W 56.15% [77.81%] 2h:41m
# And like this if full:
# =14.22W 100.0% [91.21%]
status.register("battery",
    format="{status}/{consumption:.2f}W {percentage:.2f}% [{percentage_design:.2f}%] {remaining:%E%hh:%Mm}",
    alert=True,
    alert_percentage=5,
    status={
        "DIS": "↓",
        "CHR": "↑",
        "FULL": "=",
    },)

# Displays whether a DHCP client is running
status.register("runwatch",
    name="DHCP",
    path="/var/run/dhclient*.pid",)

# Note: the network module requires PyPI package netifaces
status.register("network",
    interface="eth0",
    format_up="{v4cidr} {bytes_sent:05.0f}/{bytes_recv:05.0f}|{kbs}{network_graph}",)

# Note: requires both netifaces and basiciw (for essid and quality)
status.register("network",
    interface="wlan0",
    format_up="{v4cidr} ({essid}:{quality:03.0f}%) {bytes_sent:05.0f}/{bytes_recv:05.0f}|{network_graph}",)

# Shows disk usage of /
status.register("disk",
    path="/",
    format="{used}/{total}G [{avail}G]",)

status.run()
