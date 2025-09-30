import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocationSuggestion {
  place_name: string;
  text: string;
  place_type: string;
  coordinates: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Start typing a location...",
  id,
}: LocationAutocompleteProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode', {
        body: { query },
      });

      if (error) throw error;

      if (data?.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setOpen(true);
      } else {
        setSuggestions([]);
        setOpen(false);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      toast({
        title: "Location search unavailable",
        description: "Please type your location manually",
        variant: "destructive",
      });
      setSuggestions([]);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce API calls
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.place_name);
    onChange(suggestion.place_name);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="pr-8"
            autoComplete="off"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={`${suggestion.place_name}-${index}`}
                  value={suggestion.place_name}
                  onSelect={() => handleSelectSuggestion(suggestion)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{suggestion.text}</span>
                    <span className="text-xs text-muted-foreground">{suggestion.place_name}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
