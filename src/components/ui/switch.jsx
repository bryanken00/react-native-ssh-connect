import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform } from 'react-native';

/**
 * ⚠️ LOCAL MODIFICATION — do not re-add this file with the RNR CLI's
 * `--overwrite` without re-applying this change.
 *
 * Upstream puts `transition-transform` on the Thumb unguarded, so it applies on
 * native. Every other transition in the RNR set is wrapped in
 * `Platform.select({ web })`; this one was an oversight.
 *
 * On native that class makes NativeWind's engine run `processTransition`, which
 * reads a Reanimated shared value's `.value` during React render
 * (react-native-css-interop/native-interop.js). Reanimated 4's strict mode
 * flags that, so every toggle logged:
 *
 *   [Reanimated] Reading from `value` during component render.
 *
 * It is a __DEV__-only warning with no production impact, and it is an upstream
 * incompatibility — nativewind@4.2.6 and react-native-css-interop@0.2.6 are
 * both the latest published, so there is no version to upgrade to.
 *
 * Web-guarding it removes the cause rather than hiding the symptom. The cost is
 * that the thumb snaps instead of sliding on native; it still moves, via the
 * translate-x classes below. The alternative — keeping the animation and
 * calling `configureReanimatedLogger({ strict: false })` in App.js — would
 * silence the warning globally, including for your own code, so it was not
 * chosen for a template.
 */
function Switch({
  className,
  ...props
}) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.checked ? 'bg-primary' : 'bg-input dark:bg-input/80',
        props.disabled && 'opacity-50',
        className
      )}
      {...props}>
      <SwitchPrimitives.Thumb
        className={cn(
          'bg-background size-4 rounded-full',
          Platform.select({
            // `transition-transform` is web-only here on purpose — see below.
            web: 'pointer-events-none block ring-0 transition-transform',
          }),
          props.checked
            ? 'dark:bg-primary-foreground translate-x-3.5'
            : 'dark:bg-foreground translate-x-0'
        )} />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
